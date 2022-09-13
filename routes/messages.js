const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth')
const Message = require('../models/message')
const ExpressError = require('../expressError')

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const msg = await Message.get(req.params.id)
        if(req.user.username === msg.from_user.username || msg.to_user.username) {
            return res.json(msg)
            
        } else {
            throw new ExpressError('Unauthorized', 401)
        }
    } catch (e) {
        next(e)
        
    }
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const {from_username, to_username, body} = req.body
        if(req.user.username !== from_username) {
            throw new ExpressError('Unauthorized', 401)
        }
        const createMsg = await Message.create({from_username, to_username, body})
        return res.json(createMsg)
        
        
    } catch (e) {
        next(e)
        
    }
})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
    try {
        const {id} = req.params.id
        const msg = await Message.get(id)
        if(req.user.username !== msg.to_user.username) {
            throw new ExpressError('Unauthorized', 401)
        }
        else {
            const read = await Message.read(id)
            return res.json(read)
        }

        
    } catch (e) {
        next(e)
        
    }
})

module.exports = router
