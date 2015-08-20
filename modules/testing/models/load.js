'use strict'

var request = require('request');


var calculate = function(originalStr){
  var sum=0, delta=[0,1,2,3,4,-4,-3,-2,-1,0],
  deltaIndex, deltaValue;

  for (var i=0; i<originalStr.length; i++ ){
    sum += parseInt(originalStr.substring(i,i+1));
  }

  for (var i=originalStr.length-1; i>=0; i-=2){
    sum += delta[parseInt(originalStr.substring(i,i+1))];
  }

  if (10-(sum%10)===10){ return 0; }
  return 10-(sum%10);
};


module.exports = function(Load) {
  class HsmApiService {
    constructor () {
      this.host = 'http://10.145.2.24:9001/hsmservercommand';

      this.vtms = [];
    }

    getAccountList () {
      var accountList = [];

      for (var i = 10; i <= 99; i++) {
        accountList.push ("1310000000031" + i + calculate("1310000000031" + i))
      };

      return accountList
    }

    getRandomAccount () {

    }

    getBrokerAccount () {
      return "1110000000000005"
    }

    getTestAccount () {
      return "1310000000032568"
    }

    pushVtm(vtm) {
      this.vtms.push(vtm);
    }

    popVtm() {
      return this.vtms.pop()
    }

    getRequest (url, callback) {
      return request({
        url: url,
        headers: {
          'Content-Type': 'application/json'
        }
      }, callback);
    }

    postRequest (url, body, callback) {
      body = JSON.stringify(body);
      return request.post({
        url: url,
        headers: {
          'Content-Type': 'application/json'
        },
        body: body
      }, callback);
    }

    activate (accountId) {
      var self = this;

      this.url = this.host + '/mintchip/' + accountId + '/activate';

      console.log("url", this.url);

      return new Promise (function (resolve, reject) {
        self.getRequest(self.url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            body = JSON.parse(body);

            if (! body.id) {
              reject(new Error('Missing ID'));
            } else {
              resolve(body);
            }
          } else {
            if (response) {
                      reject({
                        response: response.statusCode,
                        responseMessage: response.statusMessage,
                        error:error})
            } else {
              reject(error)
            }
          }
        })
      });
    }

    info (accountId) {
      var self = this;

      this.url = this.host + '/mintchip/' + accountId + '/info';

      return new Promise (function (resolve, reject) {
        self.getRequest(self.url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            body = JSON.parse(body);

            if (! body.id) {
              reject(new Error('Missing ID'));
            } else {
              resolve(body);
            }
          } else {
            if (response) {
                      reject({
                        response: response.statusCode,
                        responseMessage: response.statusMessage,
                        error:error})
            } else {
              reject(error)
            }
          }
        })
      });
    }

    create (payerId, payeeId, amount) {
      var self = this;

      this.url = this.host + '/mintchip/createvtm';

      return new Promise (function (resolve, reject) {
        self.postRequest(self.url, {
          payer_id: payerId,
          payee_id: payeeId,
          currency_code: 1,
          amount_cents: 1,
          include_cert_in_vtm: true
        }, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            body = JSON.parse(body);

            if (! body.vtmb64) {
              reject('Missing ID');
            } else {
              resolve(body)
            }
          } else {
            if (response) {
                      reject({
                        response: response.statusCode,
                        responseMessage: response.statusMessage,
                        error:error})
            } else {
              reject(error)
            }
          }
        })
      });
    }


    load (vtmb64) {
      var self = this;

      this.url = this.host + '/mintchip/acceptvtm';

      return new Promise (function (resolve, reject) {
        self.postRequest(self.url, {
          vtmb64: vtmb64
        },function (error, response, body) {
          if (!error && response.statusCode == 200) {
            body = JSON.parse(body);
            if (! body.id) {
              reject('Missing ID for loading');
            } else {
              resolve(body)
            }
          } else {
            if (response) {
                      reject({
                        response: response.statusCode,
                        responseMessage: response.statusMessage,
                        error:error})
            } else {
              reject(error)
            }
          }
        })
      });
    }

    testOneWay(fromAccountId, toAccountId) {
      var self = this;

      var fromAccountBalance;
      var toAccountBalance;

      return Promise.all([
          self.info(fromAccountId),
          self.info(toAccountId)
        ])
        .then (function (infoList) {
          console.log(91, infoList);
          fromAccountBalance = infoList[0].balance;
          toAccountBalance   = infoList[1].balance;

          return self.create(fromAccountId, toAccountId, 1);
        })
        .then (function (data) {
          console.log(92, data);
          return self.load(data.vtmb64)
        })
        .then (function (result) {
          return Promise.all([
            self.info(fromAccountId),
            self.info(toAccountId)
          ])
        })
        .then (function (infoList) {
          console.log(96, infoList);
          // if (infoList[0].balance != fromAccountBalance - 1) {
          //   return Promise.reject('Error in from account balance, 1')
          // }

          // if (infoList[1].balance != toAccountBalance + 1) {
          //   return Promise.reject('Error in to account balance, 1')
          // }

          return {"valid": true, date: new Date()}

          //return self.create(toAccountId, fromAccountId, 1)
        })
        // .then (function (data) {
        //   return self.load(data.vtmb64)
        // })
        // .then (function (result) {
        //   return Promise.all([
        //     self.info(fromAccountId),
        //     self.info(toAccountId)
        //   ])
        // })
        // .then (function (infoList) {
        //   if (infoList[0].balance != fromAccountBalance) {
        //     return Promise.reject('Error in from account balance, 2')
        //   }

        //   if (infoList[1].balance != toAccountBalance) {
        //     return Promise.reject('Error in to account balance, 2')
        //   }

        //   return {"valid": true, date: new Date()}
        // })
    }

    testMethods(fromAccountId, toAccountId) {
      var self = this;

      var fromAccountBalance;
      var toAccountBalance;

      return Promise.all([
          self.info(fromAccountId),
          self.info(toAccountId)
        ])
        .then (function (infoList) {
          console.log(91, infoList);
          fromAccountBalance = infoList[0].balance;
          toAccountBalance   = infoList[1].balance;

          return self.create(fromAccountId, toAccountId, 1);
        })
        .then (function (data) {
          console.log(92, data);
          return self.load(data.vtmb64)
        })
        .then (function (result) {
          return Promise.all([
            self.info(fromAccountId),
            self.info(toAccountId)
          ])
        })
        .then (function (infoList) {
          console.log(96, infoList);
          if (infoList[0].balance != fromAccountBalance - 1) {
            return Promise.reject('Error in from account balance, 1')
          }

          if (infoList[1].balance != toAccountBalance + 1) {
            return Promise.reject('Error in to account balance, 1')
          }

          return {"valid": true, date: new Date()}

          //return self.create(toAccountId, fromAccountId, 1)
        })
        // .then (function (data) {
        //   return self.load(data.vtmb64)
        // })
        // .then (function (result) {
        //   return Promise.all([
        //     self.info(fromAccountId),
        //     self.info(toAccountId)
        //   ])
        // })
        // .then (function (infoList) {
        //   if (infoList[0].balance != fromAccountBalance) {
        //     return Promise.reject('Error in from account balance, 2')
        //   }

        //   if (infoList[1].balance != toAccountBalance) {
        //     return Promise.reject('Error in to account balance, 2')
        //   }

        //   return {"valid": true, date: new Date()}
        // })
    }

    testCreate () {
      var self = this;

      return this.create(hsmApi.getBrokerAccount(), hsmApi.getTestAccount())
        .then (function (vtm) {
          self.pushVtm(vtm);

          return vtm;
        });
    }

    testLoad () {
      var self = this;
      var vtm = self.popVtm();

      console.log(vtm);

      if (! vtm) {
        return Promise.reject("No VTM in memory");
      }

      return this.load(vtm.vtmb64);
    }


    checkBalanceOfAllAccounts () {
      var accountList = this.getAccountList();

      accountList.forEach(function (accountId) {

      })
    }
  };

  var hsmApi = new HsmApiService();

  Load.testOneWay = function(cb) {
    hsmApi.testOneWay(hsmApi.getBrokerAccount(), hsmApi.getTestAccount())
      .then (function (ok) {
        cb(false, ok)
        // setTimeout(function () {
        //   cb(false, ok)
        // }, 2000);
      })
      .catch (function (err) {
        console.log(err);

        cb(err);
      })
  }

  Load.testCreate = function(cb) {
    hsmApi.testCreate()
      .then (function (ok) {
        cb(false, ok)
      })
      .catch (function (err) {
        console.log(err);

        cb(err);
      })
  }

  Load.testLoad = function(cb) {
    hsmApi.testLoad()
      .then (function (ok) {
        cb(false, ok)
      })
      .catch (function (err) {
        console.log(err);

        cb(err);
      })
  }

  Load.moveToAndFrom = function(cb) {
    fromAccountId = hsmApi.getRandomAccount();
    toAccountId = hsmApi.getRandomAccount();

    if (toAccountId === fromAccountId) {
      toAccountId = hsmApi.getRandomAccount();
    }

    if (toAccountId === fromAccountId) {
      toAccountId = hsmApi.getRandomAccount();
    }

    if (toAccountId === fromAccountId) {
      toAccountId = hsmApi.getRandomAccount();
    }

    hsmApi.moveBetweenAccounts(fromAccountId, toAccountId)
      .then (function (ok) {
        cb(false, true)
      })
      .catch (function (err) {
        cb(err)
      })
  };

  Load.testConnection = function (cb) {
    hsmApi.info(hsmApi.getBrokerAccount())
      .then (function (ok) {
        cb(false, ok)
      })
      .catch (function (err) {
        cb(err);
      });
  }

  Load.activate = function (cb) {
    var accountList = hsmApi.getAccountList();

    console.log(accountList);

    accountList.forEach(function (accountId) {
      hsmApi.activate(accountId)
        .then (function (response) {
          console.log("ok", response);
        })
        .catch (function (err) {
          console.log("err", err);
        })
    })

    cb(false, true);
  }

  Load.remoteMethod(
    'activate',
    {
      produces: ['application/json'],
      returns: {
        type: "object",
        root: true
      },
      accepts: [],
      http: { verb: 'get' }
    }
  );

  Load.remoteMethod(
    'ping',
    {
      produces: ['application/json'],
      returns: {
        type: "object",
        root: true
      },
      accepts: [],
      http: { verb: 'get' }
    }
  );

  Load.remoteMethod(
    'testOneWay',
    {
      produces: ['application/json'],
      returns: {
        type: "object",
        root: true
      },
      accepts: [],
      http: { verb: 'get' }
    }
  );


  Load.remoteMethod(
    'testCreate',
    {
      produces: ['application/json'],
      returns: {
        type: "object",
        root: true
      },
      accepts: [],
      http: { verb: 'get' }
    }
  );

    Load.remoteMethod(
    'testLoad',
    {
      produces: ['application/json'],
      returns: {
        type: "object",
        root: true
      },
      accepts: [],
      http: { verb: 'get' }
    }
  );

    Load.remoteMethod(
    'testConnection',
    {
      produces: ['application/json'],
      returns: {
        type: "object",
        root: true
      },
      accepts: [],
      http: { verb: 'get' }
    }
  );
};
