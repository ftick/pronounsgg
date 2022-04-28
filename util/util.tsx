import axios from "axios"
import { GraphQLClient, gql } from "graphql-request"

export function removeChilds(parent: HTMLElement | null) {
  while (parent?.lastChild) {
      parent.removeChild(parent.lastChild);
  }
};

export function getBio(username: string): boolean {
  console.log(`Grabbing bio for @${username}`)
  const TWT_ENDPOINT = `https://api.twitter.com/2/users/by/username/${username}?user.fields=description`
  var wasSuccess = false

  axios.get(TWT_ENDPOINT, {
    headers: {
      "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TWITTER_API}`,
      // "Access-Control-Allow-Origin": "*",
      // "Access-Control-Allow-Credentials": true,
      // "Access-Control-Allow-Headers": "X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method",
      "Content-Type": "application/json"
      // "Content-Type": "application/x-www-form-urlencoded",
      // "Accept": "application/json",
    },
    timeout: 3000,
    responseType: "json"
  })
  .then(function (response: any) {
    console.log(response)
    alert(response.toString())
    wasSuccess = true
  })
  .catch(function (error: any) {
    if (error.response) {
      // Request made and server responded
      console.log('request made and server responded')
      // console.log(error.response)
      // console.log('data', error.response.data);
      // console.log('status', error.response.status);
      // console.log('headers', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.log("request made but no response received")
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    wasSuccess = false
  })
  return wasSuccess
}

export function getPronouns(slug: string, tag: string, willAlert: boolean) {
  console.log(`slug/tag::${slug}/${tag}`)
  const SGG_ENDPOINT = "https://api.smash.gg/gql/alpha"
  const client = new GraphQLClient(SGG_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.NEXT_PUBLIC_SGG_API}`,
      "Content-Type": "application/json"
    },
  })
  // console.log(process.env.NEXT_PUBLIC_SGG_API)
  var query = gql`
  query GetPronouns($slug: String!, $tag: String!) {
    tournament(slug: $slug) {
      participants(query: {
        filter: {
          gamerTag: $tag
        }
      }) {
        nodes {
          gamerTag
          user {
            player {
              gamerTag
            }
            genderPronoun
            authorizations(types:TWITTER) {
              externalUsername
            }
          }
        }
      }
    }
  }`
  var variables = {
    slug: slug,
    tag: tag
  }

  if (slug.trim() != "" && tag.trim() != "") {
    console.log("gql request sent")
  
    client.request(query, variables).then((data) => {

      console.log("gql request received")
      // console.log(data)
      const gamers = data['tournament']['participants']['nodes']
      const resultTxt = document.getElementById('result')
      if (resultTxt) {
        resultTxt.setAttribute('href', '')
        resultTxt.textContent = ''
        resultTxt.hidden = true
      }

      if (gamers.length == 0) alert(`${tag} not found`)
      for (let index = 0; index < gamers.length; index++) {
        const gamer = gamers[index];
        console.log(gamer)
        if (gamer['user']) {
          const gamerTag = gamer['gamerTag']
          const pronouns = gamer['user'].genderPronoun
          if (pronouns) {
            if (willAlert) alert(`${gamerTag} uses ${pronouns} pronouns`)
          }
          else {
            const connections = gamer['user']['authorizations']
            if (connections.length > 0) {
              const twitter = connections[0].externalUsername
              if (!getBio(twitter)) {
                if (resultTxt) {
                  resultTxt.setAttribute('href', `https://twitter.com/${twitter}`)
                  resultTxt.textContent = `Pronouns not linked. Try checking https://twitter.com/${twitter}`
                  resultTxt.hidden = false
                }
              }
            }
            else {
              if (willAlert) alert(`${gamerTag} has not yet set their pronouns on SmashGG or Twitter`)
            }
          }
        } else {
          if (willAlert) alert(`${tag} not found`)
        }
      }
    })
  } else {
    if (willAlert) alert("Textbox must be filled")
  }

}

export function getSheet(slug: string, page: number, isHome: boolean) {

  // const titleTxt = document.getElementById('app-title')
  // if (titleTxt) titleTxt.hidden = false
  const descriptionTxt = document.getElementById('app-description')
  if (descriptionTxt) descriptionTxt.textContent = "Loading"
  
  console.log(`slug::${slug}`)
  const SGG_ENDPOINT = "https://api.smash.gg/gql/alpha"
  const client = new GraphQLClient(SGG_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.NEXT_PUBLIC_SGG_API}`,
      "Content-Type": "application/json"
    },
  })
  const QUERY = gql`
  query GetSheet($slug: String!, $page: Int!) {
    tournament(slug: $slug) {
      name
      numAttendees
      participants(query: {
        page: $page,
        perPage: 300
      }) {
        nodes {
          gamerTag
          user {
            player {
              prefix
              gamerTag
            }
            genderPronoun
            authorizations(types:TWITTER) {
              externalUsername
            }
          }
        }
      }
    }
  }`
  var variables = {
    slug: slug,
    page: page
  }
  var numAttendees = 0
  var pronounsList: [string, string, string, string][] = [["","","",""]]
  pronounsList.pop()

  if (slug.trim() != "") {
    console.log("gql request sent", page)
  
    client.request(QUERY, variables).then((data) => {
      console.log("gql request received", page)
      if (page === 1) {
        const titleTxt = document.getElementById('app-title')
        const tourneyName = data['tournament']['name']
        if (titleTxt && tourneyName) titleTxt.textContent = `Welcome to the ${tourneyName} Pronoun Zone!`
      }

      // console.log(data)
      numAttendees = data['tournament']['numAttendees']
      const gamers = data['tournament']['participants']['nodes']
      const resultDiv = document.getElementById('resultDiv')
      const resultDiv2 = document.getElementById('resultDiv2')
      if (resultDiv && page === 0) {
        const resultTxt = document.getElementById('result')
        if (resultTxt) {
          resultTxt.setAttribute('href', '')
          resultTxt.textContent = ''
          resultTxt.hidden = true
        }
      }
      if (gamers.length == 0) alert(`No players found`)
      pronounsList = gamers.map(function(gamer: any){
        const user = gamer['user']
        if (user) {
          const pronouns = user.genderPronoun
          // const gamerTag = gamer['gamerTag']
          // const prefix = user['player']['prefix']
          const gamerTag = user['player']['gamerTag']
          // const fullTag = (prefix ? `${prefix} ` : "") + gamerTag
          const fullTag = gamerTag
          var returnThis = [fullTag]

          if (pronouns) returnThis.push(pronouns)
          else returnThis.push("")
          
          const connections = user['authorizations']
          if (connections.length > 0) {
            const twitter = connections[0].externalUsername
            if (twitter) {
              returnThis.push(`https://twitter.com/${twitter}`)
              returnThis.push(`@${twitter}`)
            } else {
              returnThis.push("")
              returnThis.push("")
            }
          } else {
            returnThis.push("")
            returnThis.push("")
          }
          return returnThis
        }
      })

      if (resultDiv2) {
        console.log(pronounsList.length)
        for (let i = 0; i < pronounsList.length; i++) {
          if (pronounsList[i]) {
            console.log((page-1)*300 + i, pronounsList[i][0], pronounsList[i][1])

            var entry = document.createElement("tr")
            entry.id = pronounsList[i][0].toLocaleLowerCase()

            var entry_name = document.createElement("td")
            entry_name.appendChild(document.createTextNode(pronounsList[i][0]));
            entry.appendChild(entry_name)

            var entry_pronouns = document.createElement("td")
            if (!pronounsList[i][1] && pronounsList[i][3]) {
              var link = document.createElement("a")
              link.textContent = pronounsList[i][3]
              link.href = pronounsList[i][2]
              entry_pronouns.appendChild(link)
            } else entry_pronouns.appendChild(document.createTextNode(pronounsList[i][1]));
            entry.appendChild(entry_pronouns)

            var entry_twitter = document.createElement("td")
            entry_twitter.hidden = true
            entry_twitter.appendChild(document.createTextNode(pronounsList[i][3]))
            entry.appendChild(entry_twitter)

            const table = document.getElementById('resultTable')
            table?.appendChild(entry)
          }
        }
      }

      if (page*300 < numAttendees) {
        getSheet(slug, page+1, isHome)
      } else {
        const descriptionTxt = document.getElementById('app-description')
        if (descriptionTxt) {
          descriptionTxt.textContent = `Enter a ${isHome ? "tourney slug and a " : ""}player\'s tag below`
        }
        const getSheetBtn = document.getElementById('getSheetBtn')
        if (getSheetBtn) {
          getSheetBtn.textContent = isHome ? "Change Tournament" : "Refresh Sheet"
          getSheetBtn.hidden = false
        }
        const slugBox = document.getElementById('slugBox')
        if (slugBox) slugBox.hidden = false
        const tagBox = document.getElementById('tagBox')
        if (tagBox) tagBox.hidden = false
        const getPronounsBtn = document.getElementById('getPronounsBtn')
        if (getPronounsBtn) {
          getPronounsBtn.textContent = "Find Tag"
          getPronounsBtn.hidden = false
        }
        const copySheetBtn = document.getElementById('copySheetBtn')
        if (copySheetBtn) copySheetBtn.hidden = false
        const downloadSheetBtn = document.getElementById('downloadSheetBtn')
        if (downloadSheetBtn) downloadSheetBtn.hidden = false
      }
    })
  }
}