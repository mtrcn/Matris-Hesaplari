<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class GU_Session {

	public $CI;
	private $user_id = FALSE;
	private $token = FALSE;
	private $toke_secret = FALSE;

	function GU_Session(){
		$this->CI =& get_instance();
		$this->user_id = $this->CI->session->userdata('uid');
		$this->token = $this->CI->session->userdata('oauth_token');
		$this->token_secret = $this->CI->session->userdata('oauth_token_secret');
	}

	function isLogged(){
		if ($this->user_id==FALSE)
		{
			return FALSE;
		}else
		{
			return TRUE;
		}
	}

	function getUID(){
		return $this->user_id;
	}

	function getTokens(){
		if (!empty($this->token) && !empty($this->token_secret))
		{
			return array($this->token,$this->token_secret);
		}else
		{
			return FALSE;
		}
	}

}
?>