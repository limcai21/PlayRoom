const mongoose = require('mongoose');
const account = require("../models/accounts.js");
const reviews = require("../models/reviews.js");
const favourites = require('../models/favourites.js');
const cheerio = require('cheerio');
const bcrypt = require('bcrypt')


function extractNumberFromURL(url) {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const regex = /(\d+)/;
    const matches = pathname.match(regex);

    if (matches && matches.length > 1) {
        const number = parseInt(matches[1], 10);
        return number;
    } else {
        return null;
    }
}


async function hashPassword(password) {
    const saltRounds = 10;
    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, async (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) reject(err);
                resolve(hash);
            });
        });
    });

    return hashedPassword;
};

async function comparePassword(password, hash) {
    const isSame = await new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });

    return isSame;
};


let db = {
    async connect() {
        try {
            await mongoose.connect('mongodb://127.0.0.1:27017/PlayRoom');
            return "Connected to Mongo DB";
        }
        catch (e) {
            console.log(e.message);
            throw new Error("Error connecting to Mongo DB");
        }
    },


    // ACCOUNT
    // USING
    async checkToken(token) {
        try {
            let result = await account.findOne({ token: token })
            return result;
        }
        catch (e) {
            console.log(e.message)
            throw new Error("Error at the server. Please try again later.");
        }
    },

    // USING
    async updateToken(id, token) {
        try {
            await account.findByIdAndUpdate(id, { token: token })
            return;
        }
        catch (e) {
            console.log(e.message);
            throw new Error("Error at the server. Please try again later");
        }
    },

    // USING
    async registerAccount(name, email, password, retype_password) {
        try {
            await account.create({
                name: name,
                email: email,
                password: await hashPassword(password),
            })
            return `${email} has successfully registered`;
        }
        catch (e) {
            console.log(e.message);
            throw new Error(`Unable to register ${email} to the system`)
        }
    },

    // USING
    async updateAccountPassword(id, current_password, new_password) {
        try {
            let res = await account.findOne({ _id: id })
            if (res == null) {
                return { status: false, message: "Incorrect Current Password" }
            } else {
                if (await comparePassword(current_password, res['password'])) {
                    await account.findByIdAndUpdate(id, { password: await hashPassword(new_password) });
                    return { status: true, message: "Password Updated!" };
                } else {
                    return { status: false, message: "Incorrect Current Password" }
                }
            }
        }
        catch (e) {
            console.log(e.message)
            throw new Error("Error updating password")
        }
    },

    // USING
    async logoutAccount(id) {
        try {
            await account.findByIdAndUpdate(id, { $unset: { token: 1 } });
            return;
        }
        catch (e) {
            console.log(e.message);
            throw new Error("Error at server. Try again later.");
        }
    },

    // USING
    async loginAccount(email, password) {
        try {
            let result = await account.findOne({ email: email })
            if (result != null) {
                let hashPassword = await comparePassword(password, result['password'])
                if (hashPassword) {
                    return result;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
        catch (e) {
            console.log(e.message);
            throw new Error("Error retrieving login credentials");
        }
    },

    // USING
    async getUserDetail(id) {
        try {
            let result = await account.findOne({ _id: id }, ['email', 'name']);
            return result;
        }
        catch (e) {
            console.log(e.message);
            throw new Error("Error retrieving user details");
        }
    },


    // USING
    async searchGame(query) {
        const url = 'https://store.steampowered.com/search/suggest?f=games&cc=SG&term=' + query;

        return fetch(url)
            .then(response => response.text())
            .then(html => {
                const $ = cheerio.load(html);
                const result = [];

                $('.match').each((index, element) => {
                    const url = $(element).attr('href')
                    const name = $(element).find('.match_name').text();
                    const thumbnail = $(element).find('.match_img img').attr('src');
                    const id = extractNumberFromURL(url);

                    const data = {
                        name: name.trim(),
                        thumbnail: thumbnail.trim(),
                        id: id,
                    };

                    result.push(data);
                });

                return result;
            })
            .catch(error => {
                console.error('Error:', error);
                throw error;
            });
    },

    // USING
    async getGame() {
        try {
            const response = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v0002/');
            const data = await response.json();
            return data;
        }
        catch (e) {
            console.log(e.message)
            throw new Error("Error getting game list")
        }
    },

    // USING
    async getIndividualGame(id) {
        try {
            const response = await fetch('https://store.steampowered.com/api/appdetails?appids=' + id);
            const data = await response.json();
            return data;
        }
        catch (e) {
            console.log(e.message)
            throw new Error("Error getting game details")
        }
    },

    // USING
    async checkIfGameExistInFav(user_id, game_id) {
        try {
            const result = await favourites.findOne({ user_id: user_id, game_id: game_id });
            if (result == null) {
                return false;
            } else {
                return true;
            }
        }
        catch (e) {
            console.log(e.message)
            throw new Error("Error checking game exist")
        }
    },

    // USING
    async addToFavourite(user_id, game_id, tier) {
        try {
            console.log(user_id, game_id, tier)
            const exist = await this.checkIfGameExistInFav(user_id, game_id);
            if (exist) {
                return `This game is already in your favourites`;
            } else {
                await favourites.create({ user_id: user_id, game_id: game_id, tier: tier })
                return `Succesfully added to your favourite!`;
            }
        }
        catch (e) {
            console.log(e.message);
            throw new Error(`Unable to add Game ID ${game_id} to favourite`)
        }
    },

    // USING
    async getFavourite(user_id) {
        try {
            const result = await favourites.find({ user_id: user_id });
            return result;
        }
        catch (e) {
            console.log(e.message);
            throw new Error(`Unable to retrieve ${user_id} favourites`)
        }
    },

    // USING
    async updateFavouriteTier(fav_id, tier) {
        try {
            const result = await favourites.findByIdAndUpdate(fav_id, { tier: tier })
            return result;
        }
        catch (e) {
            console.log(e.message);
            throw new Error("Error updating user favourite tier")
        }
    },

    // USING
    async deleteFavourite(fav_id) {
        try {
            const result = await favourites.deleteOne({ _id: fav_id });
            if (result.deletedCount > 0) {
                return `Game successfully removed from your favourite list`
            } else {
                return "Favourite not found";
            }
        }
        catch (e) {
            console.log(e.message);
            throw new Error(`Unable to remove ${game_id} from favourites`)
        }
    },


    // USING
    async checkIfGameReviewedBefore(user_id, game_id) {
        try {
            const result = await reviews.findOne({ user_id: user_id, game_id: game_id });
            if (result == null) {
                return false;
            } else {
                return true;
            }
        }
        catch (e) {
            console.log(e.message)
            throw new Error("Error checking game review exist")
        }
    },

    // USING
    async createReview(user_id, game_id, rating, comment) {
        try {
            const exist = await this.checkIfGameReviewedBefore(user_id, game_id);
            if (exist) {
                return `You have already submited your review for this game`;
            } else {
                await reviews.create({ user_id: user_id, game_id: game_id, rating: rating, comment: comment })
                return `Review posted!`;
            }
        }
        catch (e) {
            console.log(e.message);
            throw new Error("Fail to create review")
        }
    },

    // USING
    async getReview(user_id) {
        try {
            const result = await reviews.find({ user_id: user_id })
            return result;
        }
        catch (e) {
            console.log(e.message);
            throw new Error(`Unable to retrieve ${user_id} reviews`)
        }
    },

    async deleteReview(review_id) {
        try {
            const result = await reviews.deleteOne({ _id: review_id });
            if (result.deletedCount > 0) {
                return "Review deleted"
            } else {
                return "Review not found";
            }
        }
        catch (e) {
            console.log(e.message);
            throw new Error(`Unable to delete ${review_id} review`)
        }
    },

    // USING
    async getGameReviewByID(game_id) {
        try {
            const result = await reviews.find({ game_id: game_id }).populate("user_id", ['name', 'email']);
            return result;
        }
        catch (e) {
            console.log(e.message);
            throw new Error(`Unable to retrieve ${game_id} review list`)
        }
    },
}


module.exports = db;
