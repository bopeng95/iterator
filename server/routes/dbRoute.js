const router = require('express').Router();
const dbController = require('../controllers/dbController');
const jwt = require('jsonwebtoken');
const config = require('../config');

const verifyToken = (req, res, next) => {
  //if token matches, call next()
  jwt.verify(req.cookies.token, config.secret, (err, decode) => {
    if (err) {
      return res.status(401).send('Unauthorized User. Please sign in');
    }
    console.log('the decode:', decode);
    res.locals.user = decode;
    next();
  });
};

router.post('/project', dbController.setProject);
router.post('/addMembers', dbController.addMembers);
router.post('/getProjects', dbController.getProjects);
router.get('/allUsers', dbController.allUsers);
router.get('/allProjects', dbController.allProjects);

module.exports = router;