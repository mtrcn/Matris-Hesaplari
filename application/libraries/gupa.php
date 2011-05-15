<?php
if (!function_exists('curl_init')) {
  throw new Exception('GUPA needs the CURL PHP extension.');
}
if (!function_exists('json_decode')) {
  throw new Exception('GUPA needs the JSON PHP extension.');
}

require_once("oauth.php");

/**
 * Provides access to the GUPA Web Services
 *
 * @author Mete Ercan Pakdil <mete@mtrcn.com>
 */
class Gupa
{
  /**
   * Version.
   */
  const VERSION = '1.0.0';

  /**
   * Default options for curl.
   */
  public static $CURL_OPTS = array(
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 60,
    CURLOPT_POST           => 1,
    CURLOPT_USERAGENT      => 'gupa-php-1.0',
  );

   /**
   * GUPA and GU Domains.
   */
  public static $BASE_DOMAIN = 'http://www.geomatikuygulamalar.com';
  public static $API_DOMAIN = 'http://gupa.geomatikuygulamalar.com/v1';
  
  /**
   * The Application ID.
   */
  protected $appID;
  
  /**
   * The OAuth Consumer Key.
   */
  protected $consumerSecret;
  
   /**
   * The OAuth Consumer Secret.
   */
  protected $consumerKey;

   /**
   * Constructor
   */
  public function GUPA() {
    $CI =& get_instance();
    $this->setApplicationID($CI->config->item('appID'));
    $this->setConsumerKey($CI->config->item('consumerKey'));
    $this->setConsumerSecret($CI->config->item('consumerSecret'));
  }

  
  /**
   * Set the Application ID.
   *
   * @param String $appID the Application ID.
   */
  public function setApplicationID($appID) {
    $this->appID = $appID;
  }

  /**
   * Get the Application ID.
   *
   * @return String the Application ID
   */
  public function getApplicationID() {
    return $this->appID;
  }

  /**
   * Set the OAuth Consumer Secret.
   *
   * @param String $consumerSecret the OAuth Consumer Secret.
   */
  public function setConsumerSecret($consumerSecret) {
    $this->consumerSecret = $consumerSecret;
  }

  /**
   * Get the OAuth Consumer Secret.
   *
   * @return String the OAuth Consumer Secret
   */
  public function getConsumerSecret() {
    return $this->consumerSecret;
  }

  
  /**
   * Set the OAuth Consumer Key.
   *
   * @param String $consumerKey the OAuth Consumer Key.
   */
  public function setConsumerKey($consumerKey) {
    $this->consumerKey = $consumerKey;
  }

  /**
   * Get the OAuth Consumer Key.
   *
   * @return String the OAuth Consumer Key
   */
  public function getConsumerKey() {
    return $this->consumerKey;
  }

  /**
   * Gets a OAuth request token.
   *
   * @param String $token OAuth Token 
   * @param String $secret OAuth Token Secret
   * @return String the request token
   */
  public function getRequestToken() {
    return $this->api('/oauth/request_token/','',NULL);
  }
  
  /**
   * Gets a OAuth access token.
   *
   * @param String $token OAuth Token 
   * @param String $secret OAuth Token Secret
   * @return String the access token
   */
  public function getAccessToken($token=null,$secret=null) {
    return $this->api('/oauth/access_token/','',array($token,$secret));
  }

  /**
   * 
   * Make API Call
   * 
   * @param String $method the method path (required)
   * @param Array $params method call object
   * @param Array $token OAuth parameters 
   * @return String the response string
   */
  public function api($method, $params=array(), $token=null) {
    $result=$this->_oauthRequest($this->getApiUrl($method),$params,$token);
    return $result;
  }

  /**
   * Make a OAuth Request
   *
   * @param String $url the path (required)
   * @param Array $params the post data (required)
   * @param Array $token OAuth parameters (required)
   * @return the decoded response object
   */
  protected function _oauthRequest($url,$params,$token) {
    $consumer = new OAuthConsumer($this->getConsumerKey(), $this->getConsumerSecret(), null);
    if ($token!=null)
        $token = new OAuthToken($token[0], $token[1], null);
    $request = OAuthRequest::from_consumer_and_token($consumer, $token, 'POST', $url, $params);
    $request->sign_request(new OAuthSignatureMethod_HMAC_SHA1(), $consumer, $token);
    return $this->makeRequest($url, $request->get_parameters());
  }

  /**
   * Makes an HTTP request. This method can be overriden by subclasses if
   * developers want to do fancier things or use something other than curl to
   * make the request.
   *
   * @param String $url the URL to make the request to
   * @param Array $params the parameters to use for the POST body
   * @param CurlHandler $ch optional initialized curl handle
   * @return String the response text
   */
  protected function makeRequest($url, $params, $ch=null) {
    if (!$ch) {
      $ch = curl_init();
    }

    $opts = self::$CURL_OPTS;
    $opts[CURLOPT_POSTFIELDS] = http_build_query($params, null, '&');
    $opts[CURLOPT_URL] = $url;
    curl_setopt_array($ch, $opts);
    $result = curl_exec($ch);
    if ($result === false) {
      curl_close($ch);
      return $result;
    }
    curl_close($ch);
    return $result;
  }

  /**
   * Validates license code is sent as a query parameter.
   *
   * @return Boolean TRUE if it is valid, FALSE otherwise
   */
  public function validateQueryLicenseCode() {
    // make sure license field exist
    if (isset($_REQUEST['license'])) {
      // validate the signature
      $params=explode('.', $_REQUEST['license']);
      if (count($params)!=2) 
      	return FALSE;
      if (md5($params[0].$this->getConsumerSecret()) != $params[1])
        return FALSE;
      else
        return $params[0];
    }else
    	return FALSE;
  }


  /**
   * Build the URL for api given parameters.
   *
   * @param $method String the method path (required).
   * @return String the URL for the given parameters
   */
  protected function getApiUrl($method) {
      return self::$API_DOMAIN.strtolower($method);
  }
  
  /**
   * Build the URL for user login via GU.
   *
   * @return String the login URL
   */
  public function getLoginUrl() {
        return self::$BASE_DOMAIN.'/user/login/app/'.self::getApplicationID();
  }

}
