<?php 
class final_rest
{



/**
 * @api  /api/v1/setTemp/
 * @apiName setTemp
 * @apiDescription Add remote temperature measurement
 *
 * @apiParam {string} location
 * @apiParam {String} sensor
 * @apiParam {double} value
 *
 * @apiSuccess {Integer} status
 * @apiSuccess {string} message
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":0,
 *              "message": ""
 *     }
 *
 * @apiError Invalid data types
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":1,
 *              "message":"Error Message"
 *     }
 *
 */
	public static function signUp ($name, $username, $password) {
                try {
                        $EXIST=GET_SQL("select * FROM auth where username=?", $username);
                        if (count($EXIST) > 0) {
                                $retData["status"] = 1;
                                $retData["message"] = "User $username already exists";
                        } else {
                                EXEC_SQL("insert into auth (name, username, password) values (?,?,?)", $name, $username, password_hash($password, PASSWORD_DEFAULT));
                                $retData["status"] = 0;
                                $retData["message"]="User $username successfully inserted";
                        }
		} catch  (Exception $e) {
                                $retData["status"] = 1;
                                $retData["message"]=$e->getMessage();
                }
                
	 return json_encode ($retData);
	 }

	  public static function login ($username, $password) {
                try {
                        $USER=GET_SQL("select * FROM auth where username=?", $username);
                        if (count($USER) == 1) {
                                if (password_verify($password, $USER[0]["password"])) {
					$id = session_create_id();
					EXEC_SQL("update auth set session=?, expiration = DATETIME(CURRENT_TIMESTAMP, '+30 minutes') where username=?", $id, $username);
					$retData["status"]=0;
					$retData["session"]=$id;
					$retData["message"]="User '$username' logged in";
				} else {
					$retData["status"]=1;
					$retData["message"]="User/Password not found";
				}
                        } else {
                                $retData["status"]=1;
				$retData["message"]="User/Password not found";
                        }
                } catch  (Exception $e) {
                                $retData["status"]=1;
                                $retData["message"]=$e->getMessage();
                }
		return json_encode ($retData);
	  }

	public static function logout ($username, $session) {
            try {
			$USER=GET_SQL("select * from auth where username=? and session=?", $username, $session);
			if (count($USER) == 1) {
				EXEC_SQL("update auth set session=null, expiration=null where username=?", $username);
				$retData["status"]=0;
				$retData["message"]="User '$username' logged out";
			} else {
				$retData["status"]=1;
				$retData["message"]="User not found";
			}
                } catch  (Exception $e) {
                                $retData["status"]=1;
                                $retData["message"]=$e->getMessage();
                }
                return json_encode ($retData);
          }

          
          public static function session($session)
          {
              try {
                  $USER = GET_SQL("select * from auth where session=?", $session);
                  $retData["valid"] = (count($USER) == 1);
              } catch (Exception $e) {
                  $retData["valid"] = false;
                  $retData["message"] = $e->getMessage();
              }
              return json_encode($retData);
          }

          public static function favorite($username) {
            try {
                $FAV = GET_SQL("select favstock FROM favorite where username=?", $username);
                if (count($FAV) == 0) {
                    $retData["status"] = 1;
                    $retData["message"] = "";
                    $retData["data"] = []; 
                } else {
                    $retData["status"] = 0;
                    $retData["message"] = "Favorites found";
                    $retData["data"] = $FAV;
                }
            } catch (Exception $e) {
                $retData["status"] = 1;
                $retData["message"] = $e->getMessage();
                $retData["data"] = []; 
            }
            return json_encode($retData);
        }
        


          public static function addFav($username, $favstock) {
            try {
                $userExists = GET_SQL("SELECT * FROM users WHERE username=?", $username);
                if (count($userExists) == 0) {
                    $retData["status"] = 1;
                    $retData["message"] = "User does not exist";
                    return json_encode($retData);
                }

                $FAV = GET_SQL("select * FROM favorite where username=? and favstock=?", $username, $favstock);
                if (count($FAV) == 0) {
                    EXEC_SQL("insert into favorite (username, favstock) VALUES (?, ?)", $username, $favstock);
                    
                    $retData["status"]=0;
                    $retData["message"]="Successfully added to favorites";
                } else {
                    $retData["status"]=1;
                    $retData["message"]="Already in favorites";
                }
            } catch (Exception $e) {
                $retData["status"]=1;
                $retData["message"]=$e->getMessage();
            } 
        
            return json_encode($retData);
        }
        
        public static function remFav($username, $favstock) {
            try {
                $FAV = GET_SQL("select * FROM favorite where username=? and favstock=?", $username, $favstock);
                if (count($FAV) > 0) {
                    EXEC_SQL("delete FROM favorite WHERE username=? AND favstock=?", $username, $favstock);
                    $retData["status"]=0;
                    $retData["message"]="Successfully removed from favorites";
                } else {
                    $retData["status"]=1;
                    $retData["message"]="Favorite not found";
                }
            } catch (Exception $e) {
                $retData["status"]=1;
                $retData["message"]=$e->getMessage();
            } 
            return json_encode($retData);
        }


        public static function log($username, $favstock, $transaction) {
            try {
                $date = date('Y-m-d H:i:s');
                EXEC_SQL("insert into datalog (username, date, `transaction`, stock) VALUES (?, ?, ?, ?)", 
                    $username, $date, $transaction, $favstock);

                    $retData["status"]=0;
                    $retData["message"]="Successfully Logged";
            } catch (Exception $e) {
                $retData["status"]=1;
                $retData["message"]=$e->getMessage();
            } 
            return json_encode($retData);
        }




        public static function transactionLog($username, $day, $sort) {
            try {
                $ADD = GET_SQL("select * from datalog where username = ? and `transaction` = 'Added'
                and DATE(date) = ?", $username, $day);

                $REM = GET_SQL("select * from datalog where username = ? and `transaction` = 'Removed'
                and DATE(date) = ?", $username, $day);

                $ALL_ADD = GET_SQL("select stock from datalog where username = ? and `transaction` = 'Added'
                and DATE(date) <= ?", $username, $day);

                $ALL_REM = GET_SQL("select stock from datalog where username = ? and `transaction` = 'Removed'
                and DATE(date) <= ?", $username, $day);

                $add_stocks = array_map(function($item) {
                    return $item['stock'];
                }, $ALL_ADD);
        
                $rem_stocks = array_map(function($item) {
                    return $item['stock'];
                }, $ALL_REM);
        
                
                $add_count = array_count_values($add_stocks);
                $rem_count = array_count_values($rem_stocks);
        
                $day_favs = [];
        
                foreach ($add_count as $stock => $count) {
                    if ($count > ($rem_count[$stock] ?? 0)) {
                        $day_favs[] = $stock;
                    }
                }

                $retData["status"]=0;
                $retData["message"] = "Data returned successfully";
                $retData["added_transactions"] = $ADD;
                $retData["removed_transactions"] = $REM;
                $retData["day_favs"] = $day_favs;
            } catch (Exception $e) {
                $retData["status"]=1;
                $retData["message"] = $e-> getMessage();
            }
            return json_encode($retData);
        }


        public static function dailyLog($username, $start, $end, $sort) {
            try {
                $curr_date = new DateTime($start);
                $end_date = new DateTime($end);
                $day_log = [];
        
                if ($sort === 'asc') {
                    while ($curr_date <= $end_date) {
                        $prop_date = $curr_date->format('Y-m-d');
                        $day_log[$prop_date] = self::transactionLog($username, $prop_date, $sort);
                        $curr_date->modify('+1 day');
                    }
                } elseif ($sort === 'desc') {
                    while ($curr_date <= $end_date) {
                        $prop_date = $curr_date->format('Y-m-d');
                        $day_log[$prop_date] = self::transactionLog($username, $prop_date, $sort);
                        $curr_date->modify('+1 day');
                    }
                    $day_log = array_reverse($day_log, true);
                }
        
                $retData["status"] = 0;
                $retData["message"] = "Daily Log Data Fetched Successfully";
                $retData["daily_log"] = $day_log;
        
            } catch (Exception $e) {
                $retData["status"] = 1;
                $retData["message"] = $e->getMessage();
            }
            return json_encode($retData);
        }


}