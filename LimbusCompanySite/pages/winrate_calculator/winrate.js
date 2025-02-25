const _BP = "Base Power"
    const _CP = "Coin Power"
    const _CC = "Coin Count"
    const _SP = "Sanity Point"


    const btn = document.querySelector(".btn")

    btn.addEventListener("click", ()=>{
        const resultText = document.querySelector(".result")
        var result = 0

        const friendlySkillInfo = {
            "Base Power" : document.querySelector(".friendly-BP").value,
            "Coin Power" : document.querySelector(".friendly-CP").value,
            "Coin Count" : document.querySelector(".friendly-CC").value,
            "Sanity Point" : document.querySelector(".friendly-SP").value,
        }
        const enemySkillInfo = {
            "Base Power" : document.querySelector(".enemy-BP").value,
            "Coin Power" : document.querySelector(".enemy-CP").value,
            "Coin Count" : document.querySelector(".enemy-CC").value,
            "Sanity Point" : document.querySelector(".enemy-SP").value,
        }


        console.log(getFinalPowers(friendlySkillInfo),getFinalPowers(enemySkillInfo))

        resultText.innerHTML = (getClashWinrate(friendlySkillInfo, enemySkillInfo) * 100).toFixed(13) + "%"
    })



    const getFinalPowers = (skillInfo)=>{
        const coinFrontChance = 0.5 + (skillInfo[_SP]/100)
        const coinBackChance = 1 - coinFrontChance
        const CC = skillInfo[_CC]

        var finalPowers = []
        var coins = new Array(CC).fill(0)

        for(let i = 0; i <= CC; i++){
            var caseCount = (factorial(CC) / factorial(CC - i)) / factorial(i)
            var power = Number(skillInfo[_BP]) + Number((skillInfo[_CP] * i))
            var chance = (coinFrontChance ** i) * (coinBackChance ** (CC - i))

            if(power < 0){
                power = 0
            }

            finalPowers = finalPowers.concat(new Array(caseCount).fill([power, chance]))
        }

        return finalPowers
    }

    const getClashWinrateWithFinalPowers = (F_FinalPowers, E_FinalPowers)=>{
        var Winrate = 0
        var win = 0
        var defeat = 0

        for(const F_FinalPower of F_FinalPowers){
            for(const E_FinalPower of E_FinalPowers){
                if(F_FinalPower[0] > E_FinalPower[0]){
                    win += F_FinalPower[1] * E_FinalPower[1]
                }else if(F_FinalPower[0] < E_FinalPower[0]){
                    defeat += F_FinalPower[1] * E_FinalPower[1]
                }
            }
        }

        Winrate = win / (win + defeat)

        return Winrate
    }

    const getClashWinrate = (friendlySkillInfo, enemySkillInfo)=>{
        const winrateTree = new Tree([1, friendlySkillInfo, enemySkillInfo, false])
        var currentNode = winrateTree.root

        var finalClashWinrate = 0

        while(true){
            if(currentNode.value[1][_CC] <= 0){
                currentNode = currentNode.parent
                currentNode.children.splice(0,1)
                continue
            }
            if(currentNode.value[2][_CC] <= 0){
                finalClashWinrate += currentNode.value[0]
                currentNode = currentNode.parent
                currentNode.children.splice(0,1)
                continue
            }

            if(currentNode.value[3] == true){
                if(currentNode.children.length === 0){
                    if(currentNode.parent === null){
                        break
                    }else{
                        currentNode = currentNode.parent
                        currentNode.children.splice(0,1)
                    }
                }else{
                    currentNode = currentNode.children[0]
                }
                continue
            }

            const winrate = getClashWinrateWithFinalPowers(getFinalPowers(currentNode.value[1]), getFinalPowers(currentNode.value[2]))
            const currentWinrate = currentNode.value[0] * winrate
            const currentDefeatrate = currentNode.value[0] * (1 - winrate)

            const copiedCurFriendlySkillInfo = structuredClone(currentNode.value[1])
            copiedCurFriendlySkillInfo[_CC] -= 1
            const copiedCurEnemySkillInfo = structuredClone(currentNode.value[2])
            copiedCurEnemySkillInfo[_CC] -= 1

            currentNode.push([currentWinrate, structuredClone(currentNode.value[1]), copiedCurEnemySkillInfo, false])
            currentNode.push([currentDefeatrate, copiedCurFriendlySkillInfo, structuredClone(currentNode.value[2]), false])
            currentNode.value[3] = true

            currentNode = currentNode.children[0]
        }

        return finalClashWinrate
    }


    const factorial = (n)=>{
        if(n <= 1){
            return 1
        }
        return n * factorial(n - 1)
    }




    class Tree {
        constructor(value) {
            this.root = new Node(value);
        }
    }
    
    class Node {
        children = [];
        parent = null;
        constructor(value) {
            this.value = value;
        }
    
        push(value) {
            this.children.push(new Node(value));
            for(var i = 0; i < this.children.length; i++){
                this.children[i].parent = this
            }
        }
    }