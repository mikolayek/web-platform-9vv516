var applePayController = (function (_data) {
  var data = _data || {};
  var DOMStrings = {
    appleButton: data.appleButton || '#applePayBtn',
    appleMerchantIdentifier: 'merchant.com.example',
    request: data.request,
    backendUrlValidateSession:
      '/trainingstorefront/electronics/en/apple/validateSession',
    backendUrlPay: '/trainingstorefront/electronics/en/apple/pay',
    requestUrl: '/trainingstorefront/electronics/en/apple/request',
    locale: 'en',
  };
  return {
    DOMStrings,
    uiApplePayButton: function (show) {
      if (show) {
        $(DOMStrings.appleButton).show();
      } else {
        $(DOMStrings.appleButton).hide();
      }
    },
    isApplePayAvailable: function () {
      return window.ApplePaySession && ApplePaySession.canMakePayments();
    },

    /**
     * Launches payment request that does not require shipping.
     */
    clickPay: function (request) {
      try {
        var session = new ApplePaySession(3, request);

        session.onvalidatemerchant = function (event) {
          applePayController
            .performValidation(event.validationURL)
            .then(function (merchantSession) {
              session.completeMerchantValidation(merchantSession);
            });
        };

        session.onpaymentauthorized = function (event) {
          applePayController
            .sendPaymentToken(event.payment.token)
            .then(function (success) {
              session.completePayment(
                success
                  ? ApplePaySession.STATUS_SUCCESS
                  : ApplePaySession.STATUS_FAILURE
              );
              info('Thank you!');
            });
        };

        session.oncancel = function (event) {
          console.error("You cancelled. Sorry it didn't work out.");
        };

        session.begin();
      } catch (e) {
        console.error("Developer mistake: '" + e.message + "'");
      }
    },
    baseUrl: function () {
      const url = window.location;
      const baseUrl = url.protocol + '//' + url.host;
      return baseUrl;
    },
    performValidation: function (validationUrl) {
      return axios.post(
        applePayController.baseUrl() + DOMStrings.backendUrlValidateSession,
        {
          appleUrl: validationUrl,
        },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    },
    sendPaymentToken: function (token) {
      return axios.post(
        applePayController.baseUrl() + DOMStrings.backendUrlPay,
        {
          token: token,
        },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    },
  };
})();
