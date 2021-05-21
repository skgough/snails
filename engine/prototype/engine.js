const goToLeg = (num, message) => {
    message(`Leg: ${num}`)
    updateTrack(message,race.legs[num])
    updateTable(message,race.legs[num])
}

const race = {
    contestants: [],
    rng: (min,max) => Math.random() * (max - min) + min,
    legs: [],
    init: (parameters) => {
        const snails = parameters[0]
        const strats = parameters[1]
        const types = parameters[2]

        for (const snail of snails) {
            const type = types.find(type => type.name === snail.type)
            const strat = strats.find(strat => strat.name === snail.strategy)
            race.contestants.push({
                name: snail.name,
                type: type,
                strategy: strat.weights,
                ability: eval(`(args) => { ${type.function} }`),
                weight: snail.weight,
                wins: snail.wins,
                acceleration: getAcceleration(snail.weight,type)
            })
        }
        let over = false
        let i = 0
        while(!over) {
            const leg = {
                snails: [],
                events: []
            }
            for (const each in race.contestants) {
                const snail = race.contestants[each]
                let strategy = 0
                if (i<snail.strategy.length) {
                    strategy = snail.strategy[i]
                }
                const instance = {}
                instance.lane = parseInt(each)
                instance.type = snail.type.name
                instance.acceleration = snail.acceleration * (strategy/100 + 1)
                instance.velocity = (i) ? race.legs[i-1].snails[each].velocity + instance.acceleration : 0
                instance.position = (i) ? race.legs[i-1].snails[each].position + instance.velocity : 0
                leg.snails.push(instance)
            }
            let positions = Array.from(leg.snails, snail => snail.position)
            positions = positions.sort(function (a, b) { return a-b; }).reverse()
            for (const index in positions) {
                const match = leg.snails.find(snail => snail.position === positions[index])
                match.rank = parseInt(index) + 1
            }
            const finished = leg.snails.find(snail => snail.position >= 100)
            if (finished || i > 100) over = true
            i++
            race.legs.push(leg)
        }
    }
}

const getAcceleration = (weight,type) => {
    const normalizedWeight = (parseInt(weight) / 50) - 1
    const normalizedCd = (parseInt(type.dragCoefficient) / 50) - 1
    const weightFactor = (-2/3)*(0.5*normalizedWeight+Math.pow(normalizedWeight,5))+1
    const dragFactor = (-2/3)*(0.5*normalizedCd+Math.pow(normalizedCd,5))+1

    return weightFactor * dragFactor
}

const updateTable = (message,leg) => {
    message('update table')
    const rows = Array.from(document.querySelectorAll('.results tbody tr'))
    for (const index in rows) {
        const row = rows[index]
        const data = row.querySelectorAll('td')
        data[0].innerText = leg.snails[index].rank ? leg.snails[index].rank : 0
        data[1].innerText = leg.snails[index].type
        data[3].innerText = leg.snails[index].velocity.toFixed(2)
    }
}

const updateTrack = (message,leg) => {
    message('update track')
    const snails = Array.from(document.querySelectorAll('.lane .snail'))
    for (const index in snails) {
        snails[index].style.left = leg.snails[index].position + '%'
    }
}

export {
    goToLeg,
    getAcceleration,
    race
}