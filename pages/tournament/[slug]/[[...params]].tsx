import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../../../styles/Home.module.css'

import { useState } from 'react'
import { useRouter } from 'next/router'
import { getPronouns, getSheet, removeChilds } from '../../../util/api'

const Home: NextPage = () => {
  
  const router = useRouter()
  const { slug } = router.query
  
  const [tag, setTag] = useState(" ");
  function handleTagInput(event: any) {
    setTag(event.target.value)
  }
  function getTag() {
    return tag
  }

  var selectedTrEl: any = undefined
  
  function select(tag: string) {
    console.log(tag)
    var divEl = document.getElementById("resultTable");
    var trEl = document.getElementById(tag.toLocaleLowerCase())
    if (selectedTrEl) {
      selectedTrEl.className = "";
    }
    selectedTrEl = trEl;
    selectedTrEl.className = "selected";
    var scrollTo = selectedTrEl.offsetTop;
    if (divEl) divEl.scrollTop = scrollTo;
  }

  function copyDivToClipboard(ele: HTMLElement) {
    var range = document.createRange();
    // var ele = document.getElementById(id)
    if (ele) {
      range.selectNode(ele);
      window.getSelection()?.removeAllRanges(); // clear current selection
      window.getSelection()?.addRange(range); // to select text
      document.execCommand("copy");
      window.getSelection()?.removeAllRanges();// to deselect
    }
  }

  const getPronounsHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  
    if (slug) {
      // console.log(slug)
      const searchTag = getTag()
      const tagElement = document.getElementById(searchTag.toLocaleLowerCase())
      if (tagElement) {
        select(searchTag)
        tagElement.scrollIntoView({block: "center"});
        tagElement.className = "selected"
        const text = tagElement.getElementsByTagName("td")[1].textContent
        if (text) {
          if (text.startsWith("@")) alert(`Pronouns not linked. Try checking https://twitter.com/${text.substring(1)}`)
          else if (text.includes("pronouns")) alert(`${searchTag} uses ${text}`)
          else alert(`${searchTag} uses ${text} pronouns`)
        }
        else alert(`${searchTag} hasn't set their pronouns on SmashGG or linked their Twitter yet`)
      } else {
        getPronouns(slug.toString(), searchTag, true) 
      }
    }
  };

  const getSheetHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  
    if (slug) {
      // console.log(slug)
      const tagBox = document.getElementById('tagBox')
      if (tagBox) tagBox.hidden = true
      const getPronounsBtn = document.getElementById('getPronounsBtn')
      if (getPronounsBtn) getPronounsBtn.hidden = true
      const getSheetBtn = document.getElementById('getSheetBtn')
      if (getSheetBtn) getSheetBtn.hidden = true
      const copySheetBtn = document.getElementById('copySheetBtn')
      if (copySheetBtn) copySheetBtn.hidden = true
      const downloadSheetBtn = document.getElementById('downloadSheetBtn')
      if (downloadSheetBtn) downloadSheetBtn.hidden = true
      const resultTable = document.getElementById('resultTable')
      if (resultTable) {
        resultTable.hidden = false
        removeChilds(resultTable)
      }
      getSheet(slug.toString(), 1, false)
    }
  };

  const copySheetHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  
    if (slug) {
      // console.log(slug)
      const resultTable = document.getElementById('resultTable')
      if (resultTable) {
        copyDivToClipboard(resultTable)
      }
      alert("Pronouns Sheet copied to clipboard")
    }
  };

  // TODO: Implement CSV Download
  const downloadSheetHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  
    if (slug) {
      // console.log(slug)
      const resultTable = document.getElementById('resultTable')
      if (resultTable) {
        copyDivToClipboard(resultTable)
      }
    }
  };

    
  return (
    <div className={styles.container}>
      <Head>
        <title>PronounsGG</title>
        <meta name="description" content="A player pronouns lookup tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 id="app-title" className={styles.title}>
          Welcome to the Pronoun Zone!
        </h1>

        <p id="app-description" className={styles.description}>
          Enter a player&apos;s tag below
        </p>

        <div className={styles.grid}>
          <button id="getSheetBtn" onClick={getSheetHandler}>Load Pronoun Sheet</button>
          <button id="copySheetBtn" hidden onClick={copySheetHandler}>Copy</button>
          {/* <button id="downloadSheetBtn" hidden onClick={downloadSheetHandler}>Download</button> */}
          <button id="downloadSheetBtn" hidden>Download</button>
        </div>

        <div className={styles.grid}>
          <input id="tagBox" type="text" onChange={handleTagInput} placeholder="Player Tag (ex: Polish)"></input>
          <button id="getPronounsBtn" onClick={getPronounsHandler}>Get Pronouns</button>
        </div>

        <div id="resultDiv" className={styles.grid}>
          <a hidden id="result" href="" className={styles.card}></a>
        </div>

        <div id="resultDiv2" className={styles.grid}>
          {/* <table hidden id="resultTable"></table> */}
          <table hidden id="resultTable" className={styles.card}></table>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export default Home
