"use client"

import Script from "next/script"

export default function GoogleTranslate() {
  return (
    <>
      <div id="google_translate_element" style={{ display: "none" }} aria-hidden="true"></div>

      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />

      <Script id="google-translate-init" strategy="afterInteractive">
        {`
          function googleTranslateElementInit() {
            new google.translate.TranslateElement(
              {
                pageLanguage: 'en',
                includedLanguages: 'en,bn'
              },
              'google_translate_element'
            );
          }
        `}
      </Script>
    </>
  )
}
