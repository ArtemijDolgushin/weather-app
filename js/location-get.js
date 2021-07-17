export {Location}



class Location {



    static async getLocation() {
        return await this.#requestPosition();
    }


    static #requestPosition() {
        return new Promise(function (resolve, reject) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    resolve({latitude: pos.coords.latitude, longitude: pos.coords.longitude});
                },
                err => {
                    reject(err);
                });
        });
    }

}