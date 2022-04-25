// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { gql, GraphQLClient } from 'graphql-request'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  data: string[]
}

function getPronouns(slug: string) {
  console.log(`slug::${slug}`)
  if (slug.trim() == "") return []

  const ENDPOINT = "https://api.smash.gg/gql/alpha"
  const client = new GraphQLClient(ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.NEXT_PUBLIC_SGG_API}`,
      "Content-Type": "application/json"
    },
  })
  // console.log(process.env.NEXT_PUBLIC_SGG_API)
  var query = gql`
  query GetPronouns($slug: String!) {
    tournament(slug: $slug) {
      participants(query: {
        page: 1,
        perPage: 500
      }) {
        nodes {
          gamerTag
          user {
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
  }

  var strs: string[] = []
  console.log("gql request sent")

  client.request(query, variables).then((data) => {
    console.log("gql request received")
    // console.log(data)
    const gamers = data['tournament']['participants']['nodes']
    if (gamers.length == 0) return []

    for (let index = 0; index < gamers.length; index++) {
      const gamer = gamers[index];
      // console.log(gamer)
      if (gamer['user']) {
        const pronouns = gamer['user'].genderPronoun
        if (pronouns) {
          strs.push(`${gamer['gamerTag']} uses ${pronouns} pronouns`)
          console.log(`${gamer['gamerTag']} uses ${pronouns} pronouns`)
        } else {
          const connections = gamer['user']['authorizations']
          if (connections.length > 0) {
            const twitter = connections[0].externalUsername
            strs.push(`@${twitter}`)
            console.log(`@${twitter}`)
            // getBio(twitter)
            // const twt_resp = getBio(twitter)
            // alert(`Twitter @${twitter}: ${twt_resp}`)
          }
        }
      }
    }
  })

  return strs

}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { slug } = req.query
  if (slug && typeof slug == typeof "string") {
    var x = getPronouns(slug.toString())
    res.status(200).json({ data: x })
}}
