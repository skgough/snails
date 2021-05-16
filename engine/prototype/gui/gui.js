import { coachingStrategies } from "../modules/coachingStrategies.js"
import { snailTypes } from "../modules/snailTypes.js"
import { goToLeg } from "../modules/functions.js"
import { numberOfLegs } from "../modules/numLegs.js"

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
}

const logger = (text) => {
    let messages = document.querySelector('.output .messages')
    let code = document.createElement('code')
    code.innerText = text
    messages.appendChild(code)
    messages.scrollTop = messages.scrollHeight
}

const copy = (text) => {
    navigator.clipboard.writeText(text)
}

pageSetup()