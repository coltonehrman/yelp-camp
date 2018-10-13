const Campground = require('./models/campground');
const Comment = require('./models/comment');
const mongoose = require('mongoose');

const data = [
    {
        name: 'Rocky Hills',
        image: 'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=76a6fe71178051755a01c265ede2f17b&auto=format&fit=crop&w=1950&q=80',
        description: 'Rocky Hills resort has the greatest view you could imagine.'
    },
    {
        name: 'Ohio Mountain',
        image: 'https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=c85daa025ee04c951b6ac12fe3ba031a&auto=format&fit=crop&w=1950&q=80',
        description: 'Come explore the roots of Ohio at Ohio Mountain campground.'
    },
    {
        name: 'Smoky Woods',
        image: 'https://images.unsplash.com/photo-1533575770077-052fa2c609fc?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=ebb0b2d80f4b2d82f3587492b80e2321&auto=format&fit=crop&w=1950&q=80',
        description: 'Get lost in the wilderness at Smoky Woods campground.'
    }
];

async function seedDB() {
    await Campground.deleteMany({});
    
    const campgrounds = await Promise.all(data.map(async d => {
        const [ campground, comment1, comment2 ] = await Promise.all([
            Campground.create(d),
            Comment.create({ text: 'Amazing place!', author: 'Hiker' }),
            Comment.create({ text: 'Another comment...', author: 'Bear' })
        ]);
        
        campground.comments.push(comment1, comment2);
        return await campground.save();
    }));
    
    return campgrounds;
}

module.exports = seedDB;