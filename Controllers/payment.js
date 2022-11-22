const pool = require('../DB_Config/Config');
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);

const config = require('../DB_Config/stripe');
const stripe = require('stripe')(config.secretKey);

module.exports.index = (req, res) => {
    const fromDate = moment();
    const toDate = moment().add(5, 'years');
    const range = moment().range(fromDate, toDate);

    const years = Array.from(range.by('year')).map(m => m.year());
    const months = moment.monthsShort();

    return res.render('index', { months, years, message: req.flash() });
}

module.exports.payment = async (req, res) => {
    const token = await createToken(req.body);
    if (token.error) {
        req.flash('danger', token.error)
        return res.redirect('/');
    }
    if (!token.id) {
        req.flash('danger', 'Payment failed.');
        return res.redirect('/');
    }

    const charge = await createCharge(token.id, 2000);
    if (charge && charge.status == 'succeeded') { 
        req.flash('success', 'Payment completed.');
    } else {
        req.flash('danger', 'Payment failed.');
    }
    return res.redirect('/');
}

const createToken = async (cardData) => {
    let token = {};
    try {
        token = await stripe.tokens.create({
            card: {
                number: cardData.cardNumber,
                exp_month: cardData.month,
                exp_year: cardData.year,
                cvc: cardData.cvv
            }
        });
    } catch (error) {
        switch (error.type) {
            case 'StripeCardError':
                token.error = error.message;
                break;
            default:
                token.error = error.message;
                break;
        }
    }
    return token;
}

const createCharge = async (tokenId, amount) => {
    let charge = {};
    try {
        charge = await stripe.charges.create({
            amount: amount,
            currency: 'zar',
            source: tokenId,
            description: 'My first payment'
        });
    } catch (error) {
        charge.error = error.message;
    }
    return charge;
}

module.exports.saveCard = (req, res) => {

    let exp_date = req.body.exp_date;
    let exp_month = exp_date.substring(0, exp_date.indexOf("/")), exp_year = exp_date.substring(exp_date.indexOf("/") + 1)

    let query = {
        text: 'INSERT INTO cards (card_number, exp_month, exp_year, cvv, user_id) VALUES ($1, $2, $3, $4, $5)',
        value: [req.body.card_number, exp_month, exp_year, req.body.cvv, req.body.user_id]
    }
    pool.query(query.text, query.value).then((result) => {
        if(result.rowCount > 0){
            return res.status(201).json({msg: 'Successfully saved your card'});
        } else {
            return res.status(400).json({msg: 'Internal Server Error'});
        }
    }).catch((err) => {
        console.log(err);
    })
}