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
		$this->load->view('index');
		//$this->load->view('footer');
	}
	
	/**
	* Kullanıcıya ait projeleri gösterir
	
	function projects(){
		if (!$this->gu_session->isLogged()) redirect("");
		$this->load->view('header');
		$data["projects"]=$this->db->where("uid",$this->gu_session->getUID())->order_by('date','DESC')->get("projects");
		$this->load->view('user/projects',$data);
		$this->load->view('footer');
	}
	*/
	
	/**
	* GUPA ve kendi veritabanını kullanarak lisans ve temel kullanıcı bilgilerini gösterir
	function account(){
		if (!$this->gu_session->isLogged()) redirect("");
		$this->load->view('header');
		$data["user"]=$this->db->where("uid",$this->gu_session->getUID())->get("users")->row();
		$data["license"]=json_decode($this->gupa->api('/license/get_license',array('user_id'=>$this->gu_session->getUID()),NULL));
		$this->load->view('user/account',$data);
		$this->load->view('footer');
	}
	*/
	
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
				$this->_loadSampleData($userResult->user_id);
			}
		}
		//Oturum boyunca saklanacak veriler hazırlanır
		$data = array('uid' => $licResult->user_id,'oauth_token'=>$licResult->token,'oauth_token_secret'=>$licResult->token_secret);
        $this->session->set_userdata($data);
        //Kullanıcı projelerin listelendiği sayfaya yönlendirilir.
        redirect('calc');
	}
	
	/**
	* Örnek proje verileri yükleyen özel(private) metod.
	* 
	* @param Integer $uid üye hesap numarası (gerekli)
	function _loadSampleData($uid) {
		$this->db->query('
		INSERT INTO nh_projects (uid, tag, date, type, num_points, id, f_deltah, b_deltah, f_l, b_l, H, wl, max_dhi) VALUES
		('.$uid.', \'Bağlı Nivelman Örneği\', '.time().', \'closed\', 6, \'a:6:{i:0;s:1:"1";i:1;s:1:"2";i:2;s:1:"3";i:3;s:1:"4";i:4;s:1:"5";i:5;s:1:"6";}\', \'a:5:{i:0;s:5:"1.054";i:1;s:7:"-19.802";i:2;s:5:"5.250";i:3;s:6:"12.491";i:4;s:6:"-4.023";}\', \'a:5:{i:0;s:6:"-1.049";i:1;s:6:"19.801";i:2;s:6:"-5.246";i:3;s:7:"-12.490";i:4;s:5:"4.023";}\', \'a:5:{i:0;s:3:"300";i:1;s:3:"300";i:2;s:3:"300";i:3;s:3:"300";i:4;s:3:"300";}\', \'a:5:{i:0;s:3:"300";i:1;s:3:"300";i:2;s:3:"300";i:3;s:3:"300";i:4;s:3:"300";}\', \'a:2:{i:0;s:6:"91.644";i:5;s:6:"86.607";}\', 15, 12),
		('.$uid.', \'Açık Nivelman Örneği\', '.time().', \'free\', 4, \'a:4:{i:0;s:1:"1";i:1;s:1:"2";i:2;s:1:"3";i:3;s:1:"4";}\', \'a:3:{i:0;s:5:"2.038";i:1;s:6:"-1.606";i:2;s:5:"1.902";}\', \'a:3:{i:0;s:6:"-2.034";i:1;s:5:"1.605";i:2;s:6:"-1.897";}\', \'a:3:{i:0;s:3:"300";i:1;s:3:"300";i:2;s:3:"300";}\', \'a:3:{i:0;s:3:"300";i:1;s:3:"300";i:2;s:3:"300";}\', \'a:1:{i:0;s:7:"345.150";}\', 15, 12),
		('.$uid.', \'Kapalı Nivelman Örneği\', '.time().', \'ring\', 6, \'a:6:{i:0;s:1:"1";i:1;s:1:"2";i:2;s:1:"3";i:3;s:1:"4";i:4;s:1:"5";i:5;s:1:"6";}\', \'a:6:{i:0;s:6:"13.233";i:1;s:7:"-22.181";i:2;s:6:"-1.077";i:3;s:6:"-1.606";i:4;s:6:"-2.557";i:5;s:6:"14.202";}\', \'a:6:{i:0;s:7:"-13.231";i:1;s:6:"22.185";i:2;s:5:"1.079";i:3;s:5:"1.601";i:4;s:5:"2.557";i:5;s:7:"-14.204";}\', \'a:6:{i:0;s:3:"300";i:1;s:3:"300";i:2;s:3:"300";i:3;s:3:"300";i:4;s:3:"300";i:5;s:3:"300";}\', \'a:6:{i:0;s:3:"300";i:1;s:3:"300";i:2;s:3:"300";i:3;s:3:"300";i:4;s:3:"300";i:5;s:3:"300";}\', \'a:1:{i:0;s:6:"77.679";}\', 15, 12);
		');
	}
	*/
	
}