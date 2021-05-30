import { goToLeg, race, rollDice } from "../engine.js"
import Editor from "./editor.js"

const message = (text) => {
    let messages = document.querySelector('.output .messages')
    let code = document.createElement('code')
    code.innerHTML = text
    messages.appendChild(code)
    messages.scrollTop = messages.scrollHeight
}

const pageSetup = async () => {
    window.unsavedChanges = false
    window.race = race
    window.rollDice = rollDice

    let leg = 0

    let numberOfLegs = parseInt(await get('../parameters/numLegs.json'))
    let coachingStrategies = await get('../parameters/coachingStrategies.json')
    let snailTypes = await get('../parameters/snailTypes.json')
    let snails = await get('../parameters/snails.json')
    window.snailTypes = snailTypes

    const parameters = [snails, coachingStrategies, snailTypes]

    const resultsView = document.querySelector('.results')
    const resultsViewSelect = document.querySelector('.leg select')
    const legRange = document.querySelector('.leg input[type=range]')
    const legCurrent = document.querySelector('.leg .current')
    const jumpButton = document.querySelector('.leg button')
    const endCheckBox = document.querySelector('#end')
    let prefferedView = localStorage.getItem('prefferedView')
    let jumpToEnd = (localStorage.getItem('jumpToEnd') === 'true')

    if (prefferedView !== null) {
        resultsView.className = `results ${prefferedView}`
        resultsViewSelect.value = prefferedView
    }

    resultsViewSelect.addEventListener('change', () => {
        resultsView.className = `results ${resultsViewSelect.value}`
        localStorage.setItem('prefferedView', resultsViewSelect.value)
    })
    legRange.addEventListener('input', () => {
        leg = parseInt(legRange.value)
        goToLeg(leg, message, parameters)
        legCurrent.innerText = leg
    })
    jumpButton.addEventListener('click', () => {
        leg = race.legs.length - 1
        legRange.value = leg
        goToLeg(leg, message, parameters)
        legRange.value = leg
        legCurrent.innerText = leg
    })
    endCheckBox.addEventListener('change', () => {
        localStorage.setItem('jumpToEnd', endCheckBox.checked)
        jumpToEnd = endCheckBox.checked
    })

    const applyAllChanges = document.querySelector('.modifiers h3 button')
    applyAllChanges.addEventListener('click', () => postAllChanges())

    const numberOfLegsModifier = document.querySelector('.modifiers .legs input[type=number]')
    const numberOfLegsApply = document.querySelector('.modifiers .legs button')
    numberOfLegsModifier.value = numberOfLegs
    numberOfLegsModifier.addEventListener('input', () => {
        numberOfLegs = parseInt(numberOfLegsModifier.value)
        legRange.max = parseInt(numberOfLegs)
        numberOfLegsApply.removeAttribute('disabled')
        if (jumpToEnd) {
            goToLeg(numberOfLegs, message, parameters)
            legRange.value = numberOfLegs
            legCurrent.innerText = numberOfLegs
        }
        unsavedChanges = true
    })
    numberOfLegsApply.addEventListener('click', () => {
        postChange({
            target: '/parameters/numLegs.json',
            content: numberOfLegs
        })
    })

    const csSelect = document.querySelector('.coaching-strategies select')
    const csDisplays = Array.from(document.querySelectorAll('.coaching-strategies .displays div'))
    const ultRollSelectors = Array.from(document.querySelectorAll('.coaching-strategies .ult input'))
    const csSliders = Array.from(document.querySelectorAll('.coaching-strategies .sliders input'))
    const csTotal = document.querySelector('.coaching-strategies .displays span')
    const csApply = document.querySelector('.coaching-strategies button.apply')
    let csApplyDisabled = true
    const stSelect = document.querySelector('.snail-types select')
    const stDescription = document.querySelector('.snail-types .description textarea')
    const stDrag = document.querySelector('.snail-types .drag input')
    const stFunction = new Editor('.snail-types .function .code')
    const stApply = document.querySelector('.snail-types button.apply')
    const indvSnailSelect = document.querySelector('.snails h4 select')
    const indvSnailName = document.querySelector('.snails .properties .name input')
    const indvSnailType = document.querySelector('.snails .properties .type span')
    const indvSnailStrat = document.querySelector('.snails .properties .strategy select')
    const indvSnailWght = document.querySelector('.snails .properties .weight input')
    const indvSnailWins = document.querySelector('.snails .properties .wins input')
    const indvSnailApply = document.querySelector('.snails button.apply')

    for (const strategy of coachingStrategies) {
        const optgroup = csSelect.querySelector('optgroup')
        const option = document.createElement('option')
        option.innerText = strategy.name
        optgroup.appendChild(option)

        const indvOption = document.createElement('option')
        indvOption.innerText = strategy.name
        indvOption.value = strategy.name
        indvSnailStrat.appendChild(indvOption)
    }
    for (const type of snailTypes) {
        const optgroup = stSelect.querySelector('optgroup')
        const option = document.createElement('option')
        option.innerText = type.name
        option.value = type.name
        optgroup.appendChild(option)
    }
    for (const snail of snails) {
        const optgroup = indvSnailSelect.querySelector('optgroup')
        const option = document.createElement('option')
        option.innerText = snail.name
        option.value = snail.name
        optgroup.appendChild(option);
    }

    let csActive = coachingStrategies.find(strat => strat.name === csSelect.value)
    ultRollSelectors[csActive.ultRoll].checked = true
    for (const index in csActive.weights) {
        csDisplays[index].innerText = csActive.weights[index]
        csSliders[index].value = csActive.weights[index]
        csTotal.innerText = csActive.weights.reduce((acc, cur) => acc + parseInt(cur), 0)
    }
    csSelect.addEventListener('change', () => {
        csActive = coachingStrategies.find(strat => strat.name === csSelect.value)
        ultRollSelectors[csActive.ultRoll].checked = true
        for (const index in csActive.weights) {
            csDisplays[index].innerText = csActive.weights[index]
            csSliders[index].value = csActive.weights[index]
        }
    })
    for (const index in ultRollSelectors) {
        ultRollSelectors[index].addEventListener('input', () => {
            csActive.ultRoll = parseInt(index)
            csApply.removeAttribute('disabled')
        })
    }
    for (const index in csSliders) {
        csSliders[index].addEventListener('input', () => {
            const value = parseInt(csSliders[index].value)
            const total = csActive.weights.reduce((acc, cur) => acc + parseInt(cur), 0) - parseInt(csActive.weights[index]) + value
            if (total <= 100) {
                csTotal.innerText = total
                csActive.weights[index] = value
                csDisplays[index].innerText = value
                if (total === 100) {
                    csApplyDisabled = false
                    csApply.removeAttribute('disabled')
                } else if (!csApplyDisabled) {
                    csApply.setAttribute('disabled', '')
                }
            } else {
                csSliders[index].value = 100 - (csActive.weights.reduce((acc, cur) => acc + parseInt(cur), 0) - parseInt(csActive.weights[index]))
            }
        })
    }

    let stActive = snailTypes.find(strat => strat.name === stSelect.value)
    stDescription.value = stActive.description
    stDrag.value = stActive.dragCoefficient
    stFunction.value = stActive.function
    stSelect.addEventListener('change', () => {
        stActive = snailTypes.find(strat => strat.name === stSelect.value)
        stDescription.value = stActive.description
        stDrag.value = stActive.dragCoefficient
        stFunction.value = stActive.function
    })
    stDescription.addEventListener('input', () => {
        stActive.description = stDescription.value
        stApply.removeAttribute('disabled')
        unsavedChanges = true
    })
    stDrag.addEventListener('input', () => {
        stActive.dragCoefficient = parseInt(stDrag.value)
        stApply.removeAttribute('disabled')
        unsavedChanges = true
    })
    stFunction.textarea.addEventListener('input', () => {
        stActive.function = stFunction.value
        stApply.removeAttribute('disabled')
        unsavedChanges = true
    })
    window.stFunction = stFunction

    let indvSnailActive = snails.find(snail => snail.name === indvSnailSelect.value)
    indvSnailName.value = indvSnailActive.name
    indvSnailType.innerText = indvSnailActive.type
    indvSnailWght.value = indvSnailActive.weight
    indvSnailStrat.value = indvSnailActive.strategy
    indvSnailWins.value = indvSnailActive.wins
    indvSnailSelect.addEventListener('change', () => {
        indvSnailActive = snails.find(snail => snail.name === indvSnailSelect.value)
        indvSnailName.value = indvSnailActive.name
        indvSnailType.innerText = indvSnailActive.type
        indvSnailWght.value = indvSnailActive.weight
        indvSnailStrat.value = indvSnailActive.strategy
        indvSnailWins.value = indvSnailActive.wins
    })
    indvSnailName.addEventListener('input', () => {
        indvSnailActive.name = indvSnailName.value
        indvSnailApply.removeAttribute('disabled')
        unsavedChanges = true
    })
    indvSnailWght.addEventListener('input', () => {
        indvSnailActive.weight = parseInt(indvSnailWght.value)
        indvSnailApply.removeAttribute('disabled')
        unsavedChanges = true
    })
    indvSnailStrat.addEventListener('change', () => {
        indvSnailActive.strategy = indvSnailStrat.value
        indvSnailApply.removeAttribute('disabled')
        unsavedChanges = true
    })
    indvSnailWins.addEventListener('input', () => {
        indvSnailActive.wins = parseInt(indvSnailWins.value)
        indvSnailApply.removeAttribute('disabled')
        unsavedChanges = true
    })


    csApply.addEventListener('click', () => {
        postChange({
            target: '/parameters/coachingStrategies.json',
            content: coachingStrategies
        })
    })
    stApply.addEventListener('click', () => {
        postChange({
            target: '/parameters/snailTypes.json',
            content: snailTypes
        })
    })
    indvSnailApply.addEventListener('click', () => {
        postChange({
            target: '/parameters/snails.json',
            content: snails
        })
    })

    const expandos = document.querySelectorAll('[title=Expand]')
    expandos.forEach((expando) => expando.addEventListener('click', () => {
        const expanding = expando.parentElement.parentElement.parentElement
        const container = document.querySelector('.modifiers')
        const current = document.querySelector('.expanded')
        if (current === expanding) {
            expanding.classList.remove('expanded')
            container.classList.remove('expanded-within')
        } else {
            if (current !== null) current.classList.remove('expanded')
            expanding.classList.add('expanded')
            container.classList.add('expanded-within')
        }
    })
    )
    
    const postAllChanges = () => {
        fetch('/', {
            method: "POST",
            body: JSON.stringify(
                {
                    target: '/parameters/numLegs.json',
                    content: numberOfLegs
                }
            )
        }).then(
            fetch('/', {
                method: "POST",
                body: JSON.stringify(
                    {
                        target: '/parameters/coachingStrategies.json',
                        content: coachingStrategies
                    }
                )
            }).then(
                fetch('/', {
                    method: "POST",
                    body: JSON.stringify(
                        {
                            target: '/parameters/snailTypes.json',
                            content: snailTypes
                        }
                    )
                }).then(
                    fetch('/', {
                        method: "POST",
                        body: JSON.stringify(
                            {
                                target: '/parameters/snails.json',
                                content: snails
                            }
                        )
                    }).then(location.reload()))))
    }
    
    race.init(parameters)

    legRange.max = race.legs.length - 1
    if (jumpToEnd) {
        leg = race.legs.length - 1
        legRange.value = leg
        endCheckBox.checked = true
    }
    goToLeg(leg, message, parameters)
    legCurrent.innerText = leg
}

const get = async (fileName) => {
    return fetch(fileName).then(res => res.json())
}
const postChange = (data) => {
    fetch('/', {
        method: "POST",
        body: JSON.stringify(data)
    })
        .then((res) => {
            if (res.status === 200) {
                res.text()
                    .then(text => console.log(text))
                    .then(location.reload())
            } else {
                console.error(`Server status ${res.status}`)
            }
        })
}

pageSetup()

