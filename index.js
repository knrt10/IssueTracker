module.exports = robot => {
  robot.on('issues.opened', async context => {

    // GETTING all issues of that repository of user
    var owner = context.issue().owner;
    var repo = context.issue().repo;
    var number = context.issue().number;
    var count =0;
    var newcount = [];
    var params = context.issue();
    var issue = await context.github.issues.getForRepo({owner:owner , repo :repo });
      var item = [];
      for(let i=1;i<issue.data.length ;i++){
        var newissueTitle= issue.data[i].title;
        item.push(newissueTitle);
      }


// creating string comparison algorithm

    var get_bigrams, string_similarity;

    get_bigrams = function(string) {
      var i, j, ref, s, v;
      s = string.toLowerCase();
      v = new Array(s.length - 1);
      for (i = j = 0, ref = v.length; j <= ref; i = j += 1) {
        v[i] = s.slice(i, i + 2);
      }
      return v;
    };
    // comparing the 2 strings and setting a relevance to them
  string_similarity = function(str1, str2) {
    var hit_count, j, k, len, len1, pairs1, pairs2, union, x, y;
    if (str1.length > 0 && str2.length > 0) {
      pairs1 = get_bigrams(str1);
      pairs2 = get_bigrams(str2);
      union = pairs1.length + pairs2.length;
      hit_count = 0;
      for (j = 0, len = pairs1.length; j < len; j++) {
        x = pairs1[j];
        for (k = 0, len1 = pairs2.length; k < len1; k++) {
          y = pairs2[k];
          if (x === y) {
            hit_count++;
          }
        }
      }
      if (hit_count > 0) {
        return (2.0 * hit_count) / union;
      }
    }
    return 0.0;
  };

// Sending the relevance back to check it
var i, len, name, names, obj, query, relevance, results;

query =issue.data[0].title;
results = [];
for (i = 1, len = issue.data.length; i < len; i++) {
  name = issue.data[i].title;
  number1 = issue.data[i].number;
  relevance = string_similarity(query, name);
  obj = {
    name: name,
    relevance: relevance,
    number1 : number1
  };
  results.push(obj);
}

// Checking relevance and sending message to User.
// Sending fot relevance >= 0.67
for(var index=0; index<results.length;index++){
    console.log(results);
  if(results[index].relevance >=0.6){

      const params = context.issue({body: `#`+results[index].number1+` : its a matching issue with yours `});
      return context.github.issues.createComment(params) + context.github.issues.addLabels({owner:owner,repo:repo,number:number,labels:["duplicate"]}) + context.github.issues.edit({owner:owner,repo:repo,number:number,state:'closed'});

  }

}

  const params1 = context.issue({body: 'Thanks for creating a new issue .'})
  var newTitlebefore = issue.data[0].title;
  item.push(newTitlebefore);
  return context.github.issues.createComment(params1) + context.github.issues.addLabels({owner:owner,repo:repo,number:number,labels:["bug"]})


  });

  robot.on('issues.closed', async context => {

    var owner = context.issue().owner;
    var number = context.issue().number;
    var params = context.issue({body : `Issue closed by <b>` + owner + `</b>`});
    // Post a comment on the issue
    return context.github.issues.createComment(params) ;
  })
}
