<?php
/**
 * User Class
 *
 * Üye işlemlerinin yapılabilmesi için metodlar içerir
 *
 * @author Mete Ercan Pakdil
 */
class User extends CI_Controller {

	/**
	* User sınıfını yükler.
	*/
	function __construct()
	{
		parent::__construct();
		$this->load->library('gupa');	
	}
	
	/**
	* Varsayılan olarak hiç bir metod tarayıcıdan çağırılmadığında gelecektir.
	*/
	function index()
	{
		//$this->load->view('header');
		if (!$this->gu_session->isLogged()) die("Erişim Yetkiniz Yok!");
		$this->load->view('index');
		//$this->load->view('footer');
	}
	
	/**
	* Oturum açma metodudur.
	*/
	function login(){
		//Query String parametre olarak gelen "license", GUPA kütüphanesi tarafından doğrulanır.
		$license_code = $this->gupa->validateQueryLicenseCode();
		if ($license_code==FALSE){
			show_error("Geçersiz İstek.");
		}
		
		//GUPA license/get_token servisinden yeni OAuth parametreleri istenir.
		$licResult=json_decode($this->gupa->api('/license/get_token',array('license'=>$license_code),NULL));

		if ($licResult->error_code!=0){ //Eğer hata varsa kullanıcıya gösterilir.
			show_error('Lisans doğrulama hatası.<br>Hata Kodu: '.$licResult->error_code);
		}else{ 
			//Eğer hata oluşmamışsa bu kullanıcı daha önce "users" veritabınında varmı kontrol edilir.
			$dbResult=$this->db->where('uid',$licResult->user_id)->get('users')->row();
			if ($dbResult!=NULL){
				//Kullanıcı daha önce kayıt edilmişse yeni gelen parametrelerle kaydı güncellenir.
				$this->db->where('uid',$licResult->user_id)->update('users',array('oauth_token'=>$licResult->token,'oauth_token_secret'=>$licResult->token_secret));
			}else{
				//Kullanıcı daha önce veritabanında yoksa GUPA'nın /user/get_info servisinden temel kullanıcı bilgileri de sitenir.
				$userResult=json_decode($this->gupa->api('/user/get_info/',array(),array($licResult->token,$licResult->token_secret)));
				
				if (isset($userResult->error_code)){ //Eğer hata varsa gösterilir.
					show_error('Bir hata oluştu, tekrar deneyin.<br>Hata Kodu: u'.$userResult->error_code);
				}
				//Gelen temel kullanıcı bilgileriyle birlikte veritabınında kullanıcı için yeni bir kayıt oluşturulur.
				$dbResult=$this->db->insert('users',array('uid'=>$userResult->user_id,'name'=>$userResult->first_name,'surname'=>$userResult->last_name,'oauth_token'=>$licResult->token,'oauth_token_secret'=>$licResult->token_secret));
				if (!$dbResult)
					show_error('Bilgileriniz veritabanına kaydedilemedi.<br>Lütfen tekrar deneyin.');
				//Kullanıcı için her poligon türünden bir örnek proje oluşturulur.
				//$this->_loadSampleData($userResult->user_id);
			}
		}
		//Oturum boyunca saklanacak veriler hazırlanır
		$data = array('uid' => $licResult->user_id,'oauth_token'=>$licResult->token,'oauth_token_secret'=>$licResult->token_secret);
        $this->session->set_userdata($data);
        //Kullanıcı projelerin listelendiği sayfaya yönlendirilir.
        redirect('calc');
	}
	
}