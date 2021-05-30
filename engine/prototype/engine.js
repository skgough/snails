const goToLeg = (num, message) => {
    message(`Leg: ${num}`)
    race.legs[num].events.forEach(event => message(`\t${event}`))
    updateTrack(message,race.legs[num])
    updateTable(message,race.legs[num])
}

const race = {
    /*
        There are several copies of the list of snails in this code.
        
        race.contestants: a list of snails as they appear on the racetrack,
        as in the snail in lane 1 == race.contestants[0]

        race.legs[n].snails
    */
    contestants: [],
    legs: [],
    over: false,
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
                ability: eval(`(self,ranked,leg) => { ${type.function} }`), // this eval CANNOT make it into the final product.
                weight: snail.weight,
                wins: snail.wins,
                acceleration: getAcceleration(snail.weight,type)
            })
        }
        let over = false
        let i = 0
        while(!race.over) {
            const leg = {
                contestants: [],
                events: [],
                index: i
            }
            for (const each in race.contestants) {
                const snail = race.contestants[each]
                let strategy = 0
                if (i<snail.strategy.length) {
                    strategy = snail.strategy[i]
                }
                const instance = {}
                instance.snail = snail
                instance.effects = []

                // constant acceleration times stamina (strategy) multiplier
                instance.acceleration = snail.acceleration * (strategy/100 + 1)

                /*
                    v = vi + a*t
                    where vi => initial velocity (at start = 0)
                          a  => instance.acceleration
                          t  => time => 1 (each leg is the same amount of "time" so ignore)
                */
                instance.velocity = (i) ? race.legs[i-1].contestants[each].velocity + instance.acceleration : 0

                /*
                    s = si + v*t
                    where si => initial position (at start = 0)
                          v  => instance.velocity
                          t  => time => (each leg is the same amount of "time" so ignore)
                */
                instance.position = (i) ? race.legs[i-1].contestants[each].position + instance.velocity : 0

                leg.contestants.push(instance)
            }

            const finished = leg.contestants.find(snail => snail.position >= 100)
            if (finished || i > 100) race.over = true
            i++

            // sort contestants with last place at index 0
            const sorted = leg.contestants.slice()
            if (i > 0) sorted.sort(function(a,b) { return a.position - b.position})

            const ranked = sorted.slice().reverse()
            for (const index in ranked) {
                const match = leg.contestants.find(snail => snail.position === ranked[index].position)
                match.rank = parseInt(index)
            }

            // run the ability functions starting with the snail in last place
            for (const index in sorted) {
                
                const lane = leg.contestants.indexOf(leg.contestants.find(contestant => contestant.snail.name === sorted[index].snail.name))
                sorted[index].adjacent = {
                    above: leg.contestants[lane - 1],
                    below: leg.contestants[lane + 1]
                }
                sorted[index].snail.ability(leg.contestants[lane],ranked,leg)
            }

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
    const rows = Array.from(document.querySelectorAll('.results tbody tr'))
    for (const index in rows) {
        const row = rows[index]
        const data = row.querySelectorAll('td')
        data[0].innerText = leg.contestants[index].rank + 1
        data[1].innerText = leg.contestants[index].snail.name
        data[2].innerText = leg.contestants[index].snail.type.name
        data[3].innerText = leg.contestants[index].velocity.toFixed(2)
    }
}

const updateTrack = (message,leg) => {
    const snails = Array.from(document.querySelectorAll('.lane .snail'))
    for (const index in snails) {
        const distance = (leg.contestants[index].position > 100) ? 100 : leg.contestants[index].position
        snails[index].style.left = distance + '%'
    }
}

// likelihood is a percentage as a number from 0 to 100
const rollDice = (likelihood) => {
    if (likelihood >= 100) return true
    if (likelihood <= 0) return false

    const rng = (min,max) => Math.random() * (max - min) + min

    const max = 100/likelihood
    const roll = rng(0,max)
    let result = (Math.ceil(roll) === 1)
    
    return result
}

export {
    rollDice,
    goToLeg,
    getAcceleration,
    race
}