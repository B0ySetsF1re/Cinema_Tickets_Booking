class Pagination {
  constructor() {
    this.visAreaPresets = null;
    this.genAreaPresetsCompleted = null;
  }

  initVisAreaArray(total) {
    return new Promise(resolve => {
      if(total > 1 && total == 2) {
        this.visAreaPresets = new Array(0);
        this.visAreaPresets[0] = new Array(2);

        resolve();
      } else {
        this.visAreaPresets = new Array(total - 2);

        for(let i = 0; i < total - 2; i++) {
          this.visAreaPresets[i] = new Array(3);
        }

        resolve();
      }
    });
  }

  putVisAreaVals(totalPresets, totalPgs) {
    return new Promise(resolve => {

      for(let i = 0; i < totalPresets; i++) {
        for(let j = 0; j < totalPgs; j++) {
          this.visAreaPresets[i][j] = i + j + 1;
        }
      }

      resolve(this.visAreaPresets);
    });
  }

  async genVisAreaPresets(total) {

    await this.initVisAreaArray(total);

    if(total > 1 && total == 2) {
      await this.putVisAreaVals(this.visAreaPresets.length, 2)
    } else {
      await this.putVisAreaVals(total - 2, 3);
    }

    console.log(this.visAreaPresets);
  }

  async getPagePos(page) {
    /* - TBD - */
  }
}

module.exports = Pagination;
