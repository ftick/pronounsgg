import '../styles/globals.css'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  const footerRight: React.CSSProperties = {
    justifyContent: 'end',
  }

  return (
    <div>
      <Component {...pageProps} />
      <footer className={"Home_footer____T7K"}>
        <div>
          <p>Built with <svg height={"0.8rem"} viewBox="0 0 1792 1792" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"><path d="M896 1664q-26 0-44-18l-624-602q-10-8-27.5-26T145 952.5 77 855 23.5 734 0 596q0-220 127-344t351-124q62 0 126.5 21.5t120 58T820 276t76 68q36-36 76-68t95.5-68.5 120-58T1314 128q224 0 351 124t127 344q0 221-229 450l-623 600q-18 18-44 18z" fill="#e25555"></path></svg> by </p>
          <a href="https://twitter.com/Kuyachi_" target="_blank"><p>Kuyachi</p></a>
        </div>
        <div style={footerRight}>
          <p>© 2022 / Released under MIT License / </p>
          <a href="https://github.com/ftick/pronounsgg" target="_blank">
            <img height="16" width="16" src="https://unpkg.com/simple-icons@v6/icons/github.svg" />
          </a>
        </div>
      </footer>
    </div>)
}

export default MyApp
