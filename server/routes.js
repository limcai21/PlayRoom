const express = require('express');
const router = express.Router();
const crypto = require("crypto")
const db = require("./services/dbservice.js");
const cors = require('cors');

db.connect()
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error.message);
  });

router.use(express.urlencoded({ extended: true }));
router.use(express.json())
router.use(cors());

// AUTH
function authCheck(req, res, next) {
  let token = req.body.token;
  if (token) {
    db.checkToken(token)
      .then(function (response) {
        if (response) {
          res.locals.user_id = response.id;
          next();
        } else {
          res.status(401).json({ "message": "Invalid token" })
        }

      })
  } else {
    res.status(401).json({ "message": "No token provded" })
  }
}

// USING
router.get('/api/game', async (req, res) => {
  db.getGame()
    .then(function (response) {
      res.status(200).json(response)
    })
    .catch(function (error) {
      res.status(500).json({ "message": error.message });
    })
});

// USING
router.get('/api/game/search', function (req, res) {
  let q = req.query.q;
  db.searchGame(q)
    .then(function (response) {
      res.status(200).json({ "message": response });
    })
    .catch(function (error) {
      res.status(500).json({ "message": error.message });
    });
})

// USING
router.get('/api/game/:id', async (req, res) => {
  const id = req.params.id
  db.getIndividualGame(id)
    .then(function (response) {
      res.status(200).json(response[id]);
    })
    .catch(function (error) {
      res.status(500).json({ "message": error.message });
    })
});


// USING
router.post('/api/account/user', authCheck, function (req, res) {
  let id = res.locals.user_id;
  db.getUserDetail(id)
    .then(function (response) {
      res.status(200).json(response)
    })
    .catch(function (error) {
      res.status(500).json({ "message": error.message });
    });
})

// USING
router.post('/api/account/register', function (req, res) {
  let data = req.body;
  db.registerAccount(data.name, data.email, data.password)
    .then(function (response) {
      res.status(200).json({ "message": response });
    })
    .catch(function (error) {
      res.status(500).json({ "message": error.message });
    });
})

// USING
router.post('/api/account/login', function (req, res) {
  let data = req.body;
  db.loginAccount(data.email, data.password)
    .then(function (response) {
      if (response != false) {
        let strToHash = response.email + Date.now();
        let token = crypto.createHash('md5').update(strToHash).digest('hex');
        db.updateToken(response.id, token)
          .then(function (response) {
            res.status(200).json({ "message": "Login successful", "token": token });
          })
          .catch(function (error) {
            res.status(500).json({ "message": error.message });
          })

      } else {
        res.status(401).json({ "message": "Invalid Email or Password" });
      }
    })
    .catch(function (error) {
      res.status(500).json({ "message": error.message });
    });
})

// USING
router.put('/api/account/update/password', authCheck, function (req, res) {
  const id = res.locals.user_id;
  const current_password = req.body.current_password;
  const new_password = req.body.new_password;
  db.updateAccountPassword(id, current_password, new_password)
    .then(function (response) {
      res.status(200).json(response);
    })
    .catch(function (error) {
      res.status(500).json({ "message": error.message });
    })
})

// USING
router.post("/api/account/logout", authCheck, function (req, res) {
  const id = res.locals.user_id;
  db.logoutAccount(id)
    .then(function (response) {
      res.status(200).json({ "message": "Successfully logout" })
    })
    .catch(function (error) {
      res.status(500).json({ "message": error.message });
    })
})


// USING
router.post("/api/user/favourite", authCheck, function (req, res) {
  const user_id = res.locals.user_id;
  const game_id = req.body.game_id;
  const tier = req.body.tier;
  db.addToFavourite(user_id, game_id, tier)
    .then(function (response) {
      res.status(200).json({ "message": response })
    })
    .catch(function (error) {
      res.status(500).json({ "message": error.message })
    })
})

// USING
router.post("/api/user/favourite/list", authCheck, function (req, res) {
  const user_id = res.locals.user_id;
  db.getFavourite(user_id)
    .then(function (response) {
      if (response.length != 0) {
        res.status(200).json({ "message": response })
      } else {
        res.status(200).json({ "message": "You have no favourite yet. Add one" })
      }
    })
    .catch(function (error) {
      res.status(500).json({ "message": error.message })
    })
})

// USING
router.put("/api/user/favourite/:fav_id", authCheck, function (req, res) {
  const fav_id = req.params.fav_id;
  const tier = req.body.tier;
  db.updateFavouriteTier(fav_id, tier)
    .then(function (response) {
      if (response) {
        res.status(200).json({ "message": "Favourite tier updated" })
      } else {
        res.status(404).json({ "message": "Favourite not found" })
      }
    })
    .catch(function (error) {
      res.status(500).json({ "message": error.message })
    })

})

// USING
router.delete("/api/user/favourite/:fav_id", authCheck, function (req, res) {
  const fav_id = req.params.fav_id;

  db.deleteFavourite(fav_id)
    .then(function (response) {
      res.status(200).json({ "message": response })
    })
    .catch(function (error) {
      res.status(500).json({ "message": error.message })
    })
})


// USING
router.post("/api/user/review", authCheck, function (req, res) {
  const user_id = res.locals.user_id;
  const game_id = req.body.game_id;
  const rating = req.body.rating;
  const comment = req.body.comment;
  db.createReview(user_id, game_id, rating, comment)
    .then(function (response) {
      res.status(200).json({ "message": response })
    })
    .catch(function (error) {
      res.status(500).json({ "message": error.message })
    })
})

// USING
router.post("/api/user/review/list", authCheck, function (req, res) {
  const user_id = res.locals.user_id;
  db.getReview(user_id)
    .then(function (response) {
      if (response.length != 0) {
        res.status(200).json({ "message": response })
      } else {
        res.status(200).json({ "message": "You have not review anything yet" })
      }
    })
    .catch(function (error) {
      res.status(500).json({ "message": error.message })
    })
})

// USING
router.delete("/api/user/review/:review_id", authCheck, function (req, res) {
  const review_id = req.params.review_id;
  db.deleteReview(review_id)
    .then(function (response) {
      res.status(200).json({ "message": response })
    })
    .catch(function (error) {
      res.status(500).json({ "message": error.message })
    })
})

// USING
router.get("/api/game/review/:game_id", function (req, res) {
  const game_id = req.params.game_id;
  db.getGameReviewByID(game_id)
    .then(function (response) {
      if (response.length != 0) {
        res.status(200).json({ "reviews": response })
      } else {
        res.status(200).json({ "message": "No review yet" })
      }
    })
    .catch(function (error) {
      res.status(500).json({ "message": error.message })
    })
})


// UI
// router.get("/", function (req, res) {
//   res.sendFile(__dirname + "/views/index.html")
// })

// router.get("/login", function (req, res) {
//   res.sendFile(__dirname + "/views/login.html")
// })

// router.get("/register", function (req, res) {
//   res.sendFile(__dirname + "/views/register.html")
// })

// router.get("/game", function (req, res) {
//   res.sendFile(__dirname + "/views/game.html")
// })

// router.get("/account", function (req, res) {
//   res.sendFile(__dirname + "/views/account.html")
// })

module.exports = router;