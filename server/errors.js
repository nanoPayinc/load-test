'use strict';

function PaymentError(message){
  if (PaymentError.innercall === undefined){
      PaymentError.innercall             = true;
      PaymentError.prototype             = new Error(message);
      PaymentError.prototype.name        = 'PaymentError';
      PaymentError.prototype.constructor = PaymentError;
      PaymentError.prototype.status      = '400';

      return new PaymentError(message);
  }

  delete PaymentError.innercall;
}

GLOBAL.PaymentError = PaymentError;

function ValidationError(message){
  if(ValidationError.innercall===undefined){
      ValidationError.innercall = true;
      ValidationError.prototype = new Error(message);
      ValidationError.prototype.name = 'ValidationError';
      ValidationError.prototype.constructor = ValidationError;
      ValidationError.prototype.status = '422';

      return new ValidationError(message);
  }

  delete ValidationError.innercall;
}

GLOBAL.ValidationError = ValidationError;

function AuthorizationError(message){
  if(AuthorizationError.innercall===undefined){
      AuthorizationError.innercall = true;
      AuthorizationError.prototype = new Error(message);
      AuthorizationError.prototype.name = 'AuthorizationError';
      AuthorizationError.prototype.constructor = AuthorizationError;
      AuthorizationError.prototype.status = '401';

      return new AuthorizationError(message);
  }

  delete AuthorizationError.innercall;
}

GLOBAL.AuthorizationError = AuthorizationError;
