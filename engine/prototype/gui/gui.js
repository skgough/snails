import { goToLeg } from "../functions.js"
const numberOfLegs = await get('../parameters/numLegs.json')
let coachingStrategies = await get('../parameters/coachingStrategies.json')
let snailTypes = await get('../parameters/snailTypes.json')

let leg = 0

const pageSetup = () => {
    const legRange = document.querySelector('.leg input[type=range]')
    legRange.max = numberOfLegs
    const legCurrent = document.querySelector('.leg .current')
    const jumpButton = document.querySelector('.leg button')
    const endCheckBox = document.querySelector('#end')
    const jumpToEnd = (localStorage.getItem('jumpToEnd') === 'true')

    if (jumpToEnd) {
        leg = numberOfLegs
        legRange.value = leg
        endCheckBox.checked = true
    }
    goToLeg(leg, logger)
    legCurrent.innerText = leg
    legRange.addEventListener('input', () => {
        leg = legRange.value
        goToLeg(leg, logger)
        legCurrent.innerText = leg
    })
    jumpButton.addEventListener('click', () => {
        leg = numberOfLegs
        goToLeg(leg, logger)
        legRange.value = leg
        legCurrent.innerText = leg
    })
    endCheckBox.addEventListener('change', () => {
        localStorage.setItem('jumpToEnd', endCheckBox.checked)
    })

    const csSelect = document.querySelector('.coaching-strategies select')
    const stSelect = document.querySelector('.snail-types select')
    for (const strategy of coachingStrategies) {
        const option = document.createElement('option')
        option.innerText = strategy.name
        csSelect.appendChild(option);
    }
    for (const type of snailTypes) {
        const option = document.createElement('option')
        option.innerText = type.name
        stSelect.appendChild(option);
    }

    const csApply = document.querySelector('.coaching-strategies button.apply')
    const stApply = document.querySelector('.snail-types button.apply')
    csApply.addEventListener('click', () => {
        let data = { 
            target: '/parameters/coachingStrategies.json',
            content: coachingStrategies
        }
        fetch('/', {
          method: "POST", 
          body: JSON.stringify(data)
        }).then(res => res.text().then(text => console.log(text)))
        location.reload()
    })
    stApply.addEventListener('click', () => {
        let data = {
            target: '/parameters/snailTypes.json',
            content: snailTypes
        }
        fetch('/', {
          method: "POST", 
          body: JSON.stringify(data)
        }).then(res => res.text().then(text => console.log(text)))
        location.reload()
    })
}

async function get(fileName) {
    return fetch(fileName).then(res => res.json())
}

const logger = (text) => {
    let messages = document.querySelector('.output .messages')
    let code = document.createElement('code')
    code.innerText = text
    messages.appendChild(code)
    messages.scrollTop = messages.scrollHeight
}

pageSetup()