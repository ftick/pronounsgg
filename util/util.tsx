import axios from "axios"
import { GraphQLClient, gql } from "graphql-request"

export function removeChilds(parent: HTMLElement | null) {
  while (parent?.lastChild) {
      parent.removeChild(parent.lastChild);
  }
};

// TODO: Fix Twitter bio grabber
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

export function getToken(): string {
  var stored = localStorage.getItem("token")
  if (stored) return stored

  var choice = confirm("SmashGG API Token not detected. Select OK to open instructions in a new tab")
  if (choice) window.open('https://developer.smash.gg/docs/authentication', '_blank')
  let foo = prompt('Paste your SmashGG API Token here.\nIt will be stored locally and won\'t be logged by PronounsGG.');
  // let foo = prompt('Paste your SmashGG API Token (https://developer.smash.gg/docs/authentication) here');
  if (foo) {
    if (confirm(`Confirm: ${foo}`)) {
      localStorage.setItem("token", foo)
      return foo
    }
    return ""
  }
  return ""
}

export function getPronouns(slug: string, tag: string, willAlert: boolean) {
  console.log(`slug/tag::${slug}/${tag}`)
  const TOKEN = getToken()
  if (TOKEN === "") {
    return
  }
  const SGG_ENDPOINT = "https://api.smash.gg/gql/alpha"
  const client = new GraphQLClient(SGG_ENDPOINT, {
    headers: {
      // authorization: `Bearer ${process.env.NEXT_PUBLIC_SGG_API}`,
      authorization: `Bearer ${TOKEN}`,
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
    console.log("gql sent")
  
    client.request(query, variables).then((data) => {

      console.log("gql received")
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
        const user = gamer['user']
        if (user) {
          const gamerTag = user['player']['gamerTag']
          const pronouns = user.genderPronoun
          if (pronouns) {
            if (willAlert) alert(`${gamerTag} uses ${pronouns} pronouns`)
          }
          else {
            const connections = user['authorizations']
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

export function getInfo(slug: string) {
  const TOKEN = getToken()
  if (TOKEN === "") {
    return
  }
  const SGG_ENDPOINT = "https://api.smash.gg/gql/alpha"
  const client = new GraphQLClient(SGG_ENDPOINT, {
    headers: {
      // authorization: `Bearer ${process.env.NEXT_PUBLIC_SGG_API}`,
      authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json"
    },
  })
  const QUERY_INFO = gql`
  query GetInfo($slug: String!) {
    tournament(slug: $slug) {
      name
    }
  }`
  var variables = {
    slug: slug,
  }

  if (slug.trim() != "") {
    console.log("gql sent info")
    client.request(QUERY_INFO, variables).then((data) => {
      console.log("gql received info")

      const titleTxt = document.getElementById('app-title')
      const tourneyName = data['tournament']['name']
      if (titleTxt && tourneyName) titleTxt.textContent = `The ${tourneyName} Pronoun Zone`
    })
  }
}

export function getSheetFromEvent(slug: string, page: number): void {
  const TOKEN = getToken()
  if (TOKEN === "") {
    return
  }
  const descriptionTxt = document.getElementById('app-description')
  if (descriptionTxt) descriptionTxt.textContent = "Loading"

  const SGG_ENDPOINT = "https://api.smash.gg/gql/alpha"
  const PER_PAGE = 225
  const client = new GraphQLClient(SGG_ENDPOINT, {
    headers: {
      // authorization: `Bearer ${process.env.NEXT_PUBLIC_SGG_API}`,
      authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json"
    },
  })
  const QUERY_EVENT = gql`
  query GetEvent($event: String!, $page: Int!, $perPage: Int!) {
    event(slug: $event) {
    	numEntrants
    	entrants(query: {
        page: $page,
        perPage: $perPage
      }) {
      	nodes {
          participants {
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
    }
  }`
  var variables = {
    event: slug,
    page: page,
    perPage: PER_PAGE
  }
  var numAttendees = 0
  var pronounsList: [string, string, string, string][] = [["","","",""]]
  pronounsList.pop()

  if (slug.trim() != "") {
    console.log("gql sent", page)
  
    client.request(QUERY_EVENT, variables).then((data) => {
      console.log("gql received", page)

      // console.log(data)
      numAttendees = data['event']['numEntrants']
      const gamers = data['event']['entrants']['nodes']
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
        // console.log(gamer)
        const user = gamer['participants'][0]['user']
        if (user) {
          // console.log(user)
          const pronouns = user.genderPronoun
          const gamerTag = user['player']['gamerTag']
          var returnThis = [gamerTag]

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
        } else {
          const backupTag = gamer['participants'][0]['gamerTag']
          return [backupTag, "", "", ""]
        }
      })

      if (resultDiv2) {
        console.log(pronounsList.length)
        for (let i = 0; i < pronounsList.length; i++) {
          if (pronounsList[i]) {
            console.log((page-1)*PER_PAGE + i, pronounsList[i][0], pronounsList[i][1])

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

      if (page*PER_PAGE < numAttendees) {
        getSheetFromEvent(slug, page+1)
      } else {
        const descriptionTxt = document.getElementById('app-description')
        if (descriptionTxt) {
          descriptionTxt.textContent = `Enter a player\'s tag below`
        }
        const getSheetBtn = document.getElementById('getSheetBtn')
        if (getSheetBtn) {
          getSheetBtn.textContent = "Refresh Sheet"
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

export function getSheetFromTourney(slug: string, page: number, isHome: boolean): void {
  const TOKEN = getToken()
  if (TOKEN === "") {
    return
  }

  const descriptionTxt = document.getElementById('app-description')
  if (descriptionTxt) descriptionTxt.textContent = "Loading"
  
  console.log(`slug::${slug}`)
  const SGG_ENDPOINT = "https://api.smash.gg/gql/alpha"
  const PER_PAGE = 300
  const client = new GraphQLClient(SGG_ENDPOINT, {
    headers: {
      // authorization: `Bearer ${process.env.NEXT_PUBLIC_SGG_API}`,
      authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json"
    },
  })
  const QUERY = gql`
  query getSheetFromTourney($slug: String!, $page: Int!, $perPage: Int!) {
    tournament(slug: $slug) {
      numAttendees
      participants(query: {
        page: $page,
        perPage: $perPage
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
    page: page,
    perPage: PER_PAGE
  }
  var numAttendees = 0
  var pronounsList: [string, string, string, string][] = [["","","",""]]
  pronounsList.pop()

  if (slug.trim() != "") {
    console.log("gql sent", page)
  
    client.request(QUERY, variables).then((data) => {
      console.log("gql received", page)

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
        // console.log(gamer)
        const user = gamer['user']
        if (user) {
          // console.log(user)
          const pronouns = user.genderPronoun
          const gamerTag = user['player']['gamerTag']
          var returnThis = [gamerTag]

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
        } else {
          const backupTag = gamer['gamerTag']
          return [backupTag, "", "", ""]
        }
      })

      if (resultDiv2) {
        console.log(pronounsList.length)
        for (let i = 0; i < pronounsList.length; i++) {
          if (pronounsList[i]) {
            console.log((page-1)*PER_PAGE + i, pronounsList[i][0], pronounsList[i][1])

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

      if (page*PER_PAGE < numAttendees) {
        getSheetFromTourney(slug, page+1, isHome)
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