/* global Vue */

const MONSTER_MAX = 200
const PLAYER_MAX = 100

new Vue({
  el: '#app',
  data: {
    ownHealth: 0,
    monsterHealth: 0,
    gameOn: false,
    attacks: [],
    victory: false,
    defeat: false
  },
  computed: {
    ownHealthbar () { return { width: (this.ownHealth / PLAYER_MAX) * 100 + '%' } },
    monsterHealthbar () { return { width: (this.monsterHealth / MONSTER_MAX) * 100 + '%' } },
    reversedAttacks () { return this.attacks.slice().reverse() },
    gameOver () { return !this.gameOn && (this.victory || this.defeat) }
  },
  watch: {
    ownHealth (value) {
      if (value <= 0) {
        this.ownHealth = 0
        this.victory = false
        this.defeat = true
        this.gameOn = false
      }
    },
    monsterHealth (value) {
      if (value <= 0) {
        this.monsterHealth = 0
        this.victory = true
        this.defeat = false
        this.gameOn = false
      }
    }
  },
  methods: {
    startGame () {
      this.ownHealth = PLAYER_MAX
      this.monsterHealth = MONSTER_MAX
      this.gameOn = true
    },
    attack () {
      let ownAttack = Math.floor(Math.random() * 10)
      this.monsterHealth -= ownAttack
      this.attacks.push({ who: 'player', what: 'attack', value: ownAttack })
      this._monsterTurn()
    },
    specialAttack () {
      let ownAttack = Math.floor(Math.random() * 20)
      this.monsterHealth -= ownAttack
      this.attacks.push({ who: 'player', what: 'special attack', value: ownAttack })
      this._monsterTurn()
    },
    heal () {
      let ownHeal = Math.floor(Math.random() * 10)
      this.ownHealth += ownHeal
      this.attacks.push({ who: 'player', what: 'heal', value: ownHeal })
      this._monsterTurn()
    },
    _monsterTurn () {
      if (this.monsterHealth < MONSTER_MAX / 4) {
        Math.random() <= 0.5 ? this._monsterSpecialAttack() : this._monsterHeal()
      } else {
        var random = Math.random()
        if (random < 0.3) {
          this._monsterSpecialAttack()
        } else if (random >= 0.3 && random <= 0.6) {
          this._monsterAttack()
        } else {
          this._monsterHeal()
        }
      }
    },
    _monsterAttack () {
      let monsterAttack = Math.floor(Math.random() * 5)
      this.ownHealth -= monsterAttack
      this.attacks.push({ who: 'monster', what: 'attack', value: monsterAttack })
    },
    _monsterSpecialAttack () {
      let monsterAttack = Math.floor(Math.random() * 10)
      this.ownHealth -= monsterAttack
      this.attacks.push({ who: 'monster', what: 'special attack', value: monsterAttack })
    },
    _monsterHeal () {
      let monsterHeal = Math.floor(Math.random() * 10)
      this.monsterHeal += monsterHeal
      this.attacks.push({ who: 'monster', what: 'heal', value: monsterHeal })
    }
  }
})
