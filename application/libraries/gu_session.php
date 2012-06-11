<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class GU_Session {

	public $CI;
	private $user_id = FALSE;

	function GU_Session(){
		$this->CI =& get_instance();
		$this->user_id = $this->CI->session->userdata('uid');
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

}
?>