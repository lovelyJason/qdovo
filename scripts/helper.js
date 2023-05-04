const _ = require('lodash')
const moment = require('moment')

hexo.extend.helper.register('sortPostsByDate', function (posts) {
  let postsObj =  _.groupBy(posts, function(value) {
    return value.date.year() + '-' + value.date.format('MM')
  })
  let postsLengthObj = {}
  for (let key in postsObj) {
    postsLengthObj[key] = postsObj[key].length
  }
  // { '2021-10': [...] }
  let dateArr = new Array(12).fill(null)
  for(let i = 11;i >= 0;i--) {
      let n = dateArr[i]
      n = moment().subtract(11 - i, 'months').format('YYYY-MM')
      dateArr[i] = n
  }
  let postsLengthArr = new Array(12).fill(0)
  for(let i = 0;i < 12;i++) {
    postsLengthArr[i] = postsLengthObj[dateArr[i]] || 0
  }
  return [dateArr, postsLengthArr]
});

hexo.extend.helper.register('sortCategorires', function(categories) {
  /*
  array:
  _Document {
    name: 'javascript',
    _id: 'clh7fvnbi0016rhy2ck8fhtc0',
    slug: [Getter],
    path: [Getter],
    permalink: [Getter],
    posts: [Getter],
    length: [Getter]
  }
  */
  let categoryArr = [], postsLengthArr = []
  categories.forEach(category => {
    categoryArr.push(category.name)
    postsLengthArr.push(category.length)
  })
  return [categoryArr, postsLengthArr]
})

hexo.extend.helper.register('sortTags', function(tags) {
  /*
  array:
  */
  let tagArr = [], postsLengthArr = []
  tags.forEach( tag => {
    tagArr.push(tag.name)
    postsLengthArr.push(tag.length)
  })
  return [tagArr, postsLengthArr]
})
