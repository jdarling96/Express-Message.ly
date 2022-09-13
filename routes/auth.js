const express = require('express')
const router = new express.Router()
const ExpressError =  require('../expressError')
const {SECRET_KEY} = require('../config')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
    try {
        const {username, password} = req.body
        const auth = await User.authenticate(username,password)
        if(auth) {
            const token = jwt.sign({username}, SECRET_KEY)
            return res.json({msg: 'Logged In', token})
        }
    } catch (e) {
        next(e)
        
    }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async (req, res, next) => {
    try {
        const {username, password, first_name, last_name, phone} = req.body
        const register = await User.register({username,password,first_name,last_name,phone})
        const token = jwt.sign({username}, SECRET_KEY)
        return res.status(201).json({msg: 'Logged In', token})
        
    } catch (e) {
        if(e.code === '23505') return next(new ExpressError('Username is taken',400))
        return next(e)
        
    }
    
    
})

module.exports = router