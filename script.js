import { ethers } from "./constants/ethers.min.js"
import {
  abiV1,
  abiV2,
  abiV3,
  contractAddressV1,
  contractAddressV2,
  contractAddressV3,
} from "./constants/ab.js"

// Initialize Ethereum provider
const provider = new ethers.JsonRpcProvider(
  "https://eth-mainnet.g.alchemy.com/v2/"
) // Add RPC URL

// Initialize contracts array
const contracts = [
  { abi: abiV1, address: contractAddressV1 },
  { abi: abiV2, address: contractAddressV2 },
  { abi: abiV3, address: contractAddressV3 },
].map(({ abi, address }) => new ethers.Contract(address, abi, provider))

// DOM elements
const tokenIdInput = document.getElementById("tokenId")
const detail = document.getElementById("detail")
const panel = document.querySelector(".panel")
const dataPanel = document.querySelector(".data-panel")
const dataContent = document.getElementById("dataContent")
const search = document.getElementById("searchInput")

// Libraries
const predefinedLibraries = {
  p5js: "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/p5.min.js",
  p5: "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/p5.min.js",
  threejs: "https://cdnjs.cloudflare.com/ajax/libs/three.js/r124/three.min.js",
  three: "https://cdnjs.cloudflare.com/ajax/libs/three.js/r124/three.min.js",
  processing:
    "https://cdnjs.cloudflare.com/ajax/libs/processing.js/1.4.6/processing.min.js",
  tonejs: "https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.15/Tone.js",
  tone: "https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.15/Tone.js",
  regl: "https://cdnjs.cloudflare.com/ajax/libs/regl/2.1.0/regl.min.js",
  paper:
    "https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.15/paper-full.min.js",
  js: "",
  svg: "",
  custom: "",
}

// Function to clear local storage
function clearLocalStorage() {
  localStorage.removeItem("contractData")
  localStorage.removeItem("newSrc")
  localStorage.removeItem("newIdHash")
  localStorage.removeItem("newArt")
  localStorage.removeItem("newType")
}

async function grabData(_tokenId) {
  try {
    clearLocalStorage()

    // Determine contract
    let contract = 0
    if (_tokenId >= 3000000 && _tokenId < 374000000) {
      contract = 1
    } else if (_tokenId >= 374000000) {
      contract = 2
    }
    const contractToUse = contracts[contract]

    // Fetch contract data
    let _hash = await (contract === 0
      ? contractToUse.showTokenHashes(_tokenId)
      : contractToUse.tokenIdToHash(_tokenId))

    const projId = await contractToUse.tokenIdToProjectId(_tokenId)
    const projectInfo = await (contract === 2
      ? contractToUse.projectScriptDetails(projId.toString())
      : contractToUse.projectScriptInfo(projId.toString()))

    // Construct script
    let _script = ""
    for (
      let i = 0;
      i < (contract === 2 ? projectInfo[2] : projectInfo[1]);
      i++
    ) {
      const scrpt = await contractToUse.projectScriptByIndex(
        projId.toString(),
        i
      )
      _script += scrpt
    }

    // Fetch project details
    let _detail = await contractToUse.projectDetails(projId.toString())

    // Extract library name
    let _codeType = ""
    if (typeof projectInfo[0] === "string" && projectInfo[0].includes("@")) {
      _codeType = projectInfo[0].split("@")[0].trim()
    } else {
      _codeType = JSON.parse(projectInfo[0]).type
    }

    // Store data in local storage
    localStorage.setItem(
      "contractData",
      JSON.stringify({ _tokenId, _hash, _script, _detail, _codeType })
    )
    update(_tokenId, _hash, _script, _detail, _codeType)
    location.reload()
  } catch (error) {
    console.error("Error:", error)
  }
}

// Function to update UI
function update(_tokenId, _hash, _script, _detail, _codeType) {
  // Update library source
  localStorage.setItem("newSrc", predefinedLibraries[_codeType])

  // Update tokenIdHash content
  const tknData =
    _tokenId < 3000000
      ? `{ tokenId: "${_tokenId}", hashes: ["${_hash}"] };`
      : `{ tokenId: "${_tokenId}", hash: "${_hash}" };`

  localStorage.setItem("newIdHash", `let tokenData = ${tknData}`)

  // Update artCode content
  let process = ""
  if (_codeType === "processing") {
    process = "application/processing"
  }
  localStorage.setItem("newType", process)
  localStorage.setItem("newArt", _script)

  // Update detail content
  if (_detail) {
    let Id =
      _tokenId < 1000000
        ? _tokenId
        : parseInt(_tokenId.toString().slice(-6).replace(/^0+/, ""))
    detail.innerText = `${_detail[0]} #${Id} / ${_detail[1]}`
    panel.innerText = _detail[2]
  }
  tokenIdInput.placeholder = `${_tokenId} `
  injectFrame()
}

// Function to inject content into the iframe
async function injectFrame() {
  const frame = document.getElementById("frame")
  const iframeDocument = frame.contentDocument || frame.contentWindow.document

  try {
    const frameSrc = localStorage.getItem("newSrc")
    const frameIdHash = localStorage.getItem("newIdHash")
    const frameArt = localStorage.getItem("newArt")
    const frameType = localStorage.getItem("newType")

    // Generate the content dynamically
    let dynamicContent
    if (storedData._tokenId > 136000000 && storedData._tokenId < 136001023) {
      dynamicContent = `<script>${frameIdHash}</script>${frameArt}`
    } else {
      dynamicContent = `<!DOCTYPE html>
          <html lang='en'>
          <head>
          <meta charset='UTF-8'>
          <meta name='viewport' content='width=device-width, initial-scale=1.0'>
          <script src='${frameSrc}'></script>
          <script>${frameIdHash}</script>
          <style type="text/css">
              html {
                  height: 100%;
              }
              
              body {
                  min-height: 100%;
                  margin: 0;
                  padding: 0;
                  background-color: #171717;
              }

              canvas {
                  padding: 0;
                  margin: auto;
                  display: block;
                  position: absolute;
                  top: 0;
                  bottom: 0;
                  left: 0;
                  right: 0;
              }
          </style>
          </head>
          <body>
          <canvas></canvas>
          <script type='${frameType}'>${frameArt}</script>
          <canvas></canvas>
          </body>
          </html>`
    }

    console.log(dynamicContent)
    // Write the generated content to the iframe
    iframeDocument.open()
    iframeDocument.write(dynamicContent)
    iframeDocument.close()
  } catch (error) {
    console.error("Error:", error)
  }
}
let storedData = {}
// Event listener when the DOM content is loaded
window.addEventListener("DOMContentLoaded", () => {
  storedData = JSON.parse(localStorage.getItem("contractData"))
  if (storedData) {
    update(...Object.values(storedData))
  }
  tokenIdInput.focus()
  console.log("lib source:", localStorage.getItem("newSrc"))
  console.log("Id an Hash:", localStorage.getItem("newIdHash"))
  console.log("code type:", localStorage.getItem("newType"))
  console.log("code:", localStorage.getItem("newArt"))
  console.log("library:", storedData._codeType)
})

tokenIdInput.addEventListener("keypress", (event) => {
  const allowedKeys = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "ArrowLeft",
    "ArrowRight",
    "Delete",
    "Enter",
  ]
  if (event.key === "Enter") {
    grabData(tokenIdInput.value)
  }

  if (!allowedKeys.includes(event.key)) {
    event.preventDefault()
  }
})

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearLocalStorage()
    location.reload()
  }
})

detail.addEventListener("click", () => {
  panel.classList.toggle("open")
})

document.addEventListener("keypress", (event) => {
  if (event.key === "\\") {
    dataPanel.classList.toggle("open")
  }
})

/****************************************************
 *        FUNCTION TO ACCESS BLOCKS DATA
 ***************************************************/

// Fetch data from "data.txt" and display it
fetch("data.txt")
  .then((response) => response.text())
  .then((data) => {
    const lines = data.split("\n")

    // Function to display lines
    function displayLines(lines) {
      dataContent.innerHTML = lines.join("<br>")
    }

    // Function to filter lines based on search query
    function filterLines(query) {
      const filteredLines = lines.filter((line) =>
        line.toLowerCase().includes(query.toLowerCase())
      )
      displayLines(filteredLines)
    }

    // Event listener for search field
    search.addEventListener("input", function (event) {
      const query = event.target.value.trim()
      filterLines(query)
    })

    // Display all lines initially
    displayLines(lines)
  })
  .catch((error) => {
    console.error("Error reading file:", error)
  })

/****************************************************
 *          FUNCTION TO SAVE THE OUTPUT
 * *************************************************/

async function saveContentAsFile(content, filename) {
  const userFilename = prompt("Enter a filename:", filename)

  if (!userFilename) {
    return
  }

  // Create a Blob containing the content
  const blob = new Blob([content], { type: "text/html" })

  // Create a temporary URL for the Blob
  const url = window.URL.createObjectURL(blob)

  // Create a temporary <a> element to trigger the download
  const link = document.createElement("a")
  link.href = url
  link.download = userFilename

  // Append the <a> element to the document body
  document.body.appendChild(link)

  // Programmatically trigger the click event on the <a> element
  link.click()

  // Clean up
  window.URL.revokeObjectURL(url)
  link.remove()
}

// Function to handle the button click event
function handleSaveButtonClick() {
  const dynamicContent =
    document.getElementById("frame").contentDocument.documentElement.outerHTML
  saveContentAsFile(dynamicContent, "block.html")
}

// Attach the handleSaveButtonClick
document
  .getElementById("saveButton")
  .addEventListener("click", handleSaveButtonClick)

/***************************************************
 *        FUNCTION TO GET RANDOM TOKEN ID
 **************************************************/

// Function to process a line and extract a constructed number
function processLine(line) {
  const regex = /^(\d+).*?(\d+)\s*minted/
  const matches = line.match(regex)
  if (!matches) return null

  // Extract numbers from the regex matches
  const firstNumber = parseInt(matches[1])
  const secondNumber = parseInt(matches[2])
  // Generate a random second number based on the second number extracted
  const randomSecondNumber = Math.floor(Math.random() * (secondNumber - 1))

  return (firstNumber * 1000000 + randomSecondNumber).toString()
}

// Function to fetch data from "data.txt", process a random line, and call grabData
async function fetchAndProcessRandomLine() {
  try {
    const response = await fetch("data.txt")
    if (!response.ok) throw new Error("Network response was not ok")

    const lines = (await response.text()).split("\n")
    const randomLine = lines[Math.floor(Math.random() * lines.length)]

    const constructedNumber = processLine(randomLine)

    if (constructedNumber) {
      console.log("Randomly selected line:", randomLine)
      console.log("Constructed Number:", constructedNumber)

      grabData(constructedNumber)
    } else {
      console.log("Invalid line format.")
      throw new Error("Invalid line format")
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error)
    throw error
  }
}

document
  .getElementById("randomButton")
  .addEventListener("click", fetchAndProcessRandomLine)

/****************************************************
 *          FUNCTIONS TO GET NEXTID TOKEN
 * *************************************************/

function incrementTokenId() {
  storedData._tokenId = storedData._tokenId
    ? (parseInt(storedData._tokenId) + 1).toString()
    : "1"

  grabData(storedData._tokenId)
  console.log(storedData._tokenId)
}

function decrementTokenId() {
  storedData._tokenId = storedData._tokenId
    ? Math.max(parseInt(storedData._tokenId) - 1, 0).toString()
    : "0"

  grabData(storedData._tokenId)
  console.log(storedData._tokenId)
}

document
  .getElementById("incrementButton")
  .addEventListener("click", function () {
    incrementTokenId()
  })

document
  .getElementById("decrementButton")
  .addEventListener("click", function () {
    decrementTokenId()
  })

/****************************************************
 *           FUNCTION TO GET ALL ART BLOCKS
 * *************************************************/

async function fetchBlocks() {
  let All = ""
  let consecutiveNoTokens = 0
  for (let i = 168; i < 800; i++) {
    const n = i < 3 ? 0 : i < 374 ? 1 : 2
    try {
      const _detail = await contracts[n].projectDetails(i.toString())
      let tkns
      if (n === 2) {
        tkns = await contracts[n].projectStateData(i)
      } else {
        tkns = await contracts[n].projectShowAllTokens(i)
      }
      if (n === 2) {
        if (tkns.invocations !== BigInt(0)) {
          All += `${i} - ${_detail[0]} / ${_detail[1]} - ${tkns.invocations} minted\n`
          consecutiveNoTokens = 0
        } else {
          console.log(`No tokens found for project ${i}`)
          consecutiveNoTokens++
        }
      } else {
        if (tkns.length !== 0) {
          All += `${i} - ${_detail[0]} / ${_detail[1]} - ${tkns.length} minted\n`
          consecutiveNoTokens = 0
        } else {
          console.log(`No tokens found for project ${i}`)
          consecutiveNoTokens++
        }
      }
    } catch (error) {
      console.log(`Error fetching data for project ${i}: ${error}`)
      consecutiveNoTokens++
    }
    if (consecutiveNoTokens >= 5) {
      console.log("No tokens found for two consecutive projects. Exiting loop.")
      break
    }
  }
  console.log(All)
}

// fetchBlocks()
