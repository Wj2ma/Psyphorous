class Cell {
  constructor(potency, insect) {
    this.potency = potency;
    if (insect) {
      this.insects = [insect];      // Used for intermediate stages of a turn.
    } else {
      this.insects = [];
    }
    this.mainInsect = insect;
  }

  getInsect() {
    return this.mainInsect;
  }

  getPotency() {
    return this.potency;
  }

  pushInsect(insect) {
    this.insects.push(insect);
  }

  shiftInsect() {
    return this.insects.shift();
  }

  // Checks if this insect did not move during this turn.
  containsStillInsect() {
    return this.mainInsect && this.mainInsect == this.insects[0];
  }

  resolveConflicts() {
    if (this.insects.length > 1) {
      let teams = this.separateInsects();
      this.computeDamages(teams);
      this.computeLastManStanding(teams);
    } else if (this.insects.length == 1) {
      this.mainInsect = this.insects[0];
    } else {
      this.mainInsect = null;
    }
  }

  // Sorts the insects into their teams and separate into their types. Also aggregate total attack.
  separateInsects() {
    let teams = { };
    while (this.insects.length > 0) {
      let insect = this.insects.pop();                  // Pop will make last insect's face take precedence.
      let botId = insect.getBotId();
      if (teams[botId]) {
        teams[botId].attackPower += insect.getAttack();
        teams[botId][insect.getType()].push(insect);
      } else {
        let team = { attackPower: insect.getAttack() };
        for (let type in Object.values(InsectType)) {
          if (type == insect.getType()) {
            team[type] = [insect];
          } else {
            team[type] = [];
          }
        }
        teams[botId] = team;
      }
    }
    return teams;
  }

  // Take damage. There should be only one team left in the end, unless a queen bee is involved.
  computeDamages(teams) {
    for (let team of Object.values(teams)) {
      let maxAttackPower = 0;
      // Get the maximum damage this team will take.
      for (let enemy of Object.values(teams)) {
        if (enemy != team && enemy.attackPower > maxAttackPower) {
          maxAttackPower = enemy.attackPower;
        }
      }

      // Take the damage in order of kill priorities.
      for (let killType of KILL_PRIORITY) {
        for (let insect of team[killType]) {
          if (maxAttackPower == 0) {
            break;
          }

          if (killType == InsectType.QUEENBEE) {
            insect.takeDamage(maxAttackPower);
          } else {
            let killAmount = insect.getKillAmount();
            if (killAmount < maxAttackPower) {
              insect.takeDamage(killAmount);
              maxAttackPower -= killAmount;
            } else {
              insect.takeDamage(maxAttackPower);
              maxAttackPower = 0;
            }
          }
        }
      }
    }
  }

  // Remove the dead, and squash remaining insects to last insect standing, which will become the new mainInsect.
  computeLastManStanding(teams) {
    let survivingTeams = 0;
    for (let team of Object.values(teams)) {
      let finalInsect = null;
      for (let killType of KILL_PRIORITY) {
        let primeInsect = team[killType].shift();
        for (;;) {
          let mergeInsect = team[killType].shift();
          if (!mergeInsect) {
            break;
          }
          primeInsect.addCount(mergeInsect.getCount());
        }

        if (primeInsect && primeInsect.getCount() > 0) {
          finalInsect = primeInsect;
        }
      }

      if (finalInsect && finalInsect.getCount() > 0) {
        this.mainInsect = finalInsect;
        ++survivingTeams;
      }
    }

    // Only time this condition is satisfied is when 2 queen bees move to the same cell. Kill them all then.
    if (survivingTeams > 1 || survivingTeams == 0) {
      this.mainInsect = null;
    } else {
      this.insects.push(this.mainInsect);
    }
  }
}
