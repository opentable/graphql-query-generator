function wait(intervalTime) {
  return new Promise(function(resolve) {
    setTimeout(resolve, intervalTime);
  });
}

function retry(myPromiseFactory, retries, intervalTime) {
  if(retries === 0) return myPromiseFactory();

  return myPromiseFactory().catch(function(){
    return wait(intervalTime).then(function(){
      retries--;
      return retry(myPromiseFactory, retries, intervalTime);
    });
  });
}

module.exports.retry = retry;
