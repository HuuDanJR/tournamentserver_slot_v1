const connection = require('./mysql_dbconfig');

async function findBetNumber(callback) {
  let query = `SELECT * FROM betnumber`;
  try {
    await connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error : ${err}`)
      }
      connection.query(query, function (err, result, fields) {
        if (err) (
          console.log(err)
        );
        callback(err, result)
      });
      conn.release();
    })

  } catch (error) {
    console.log(`An error orcur findFrameDateCustomer: ${error}`);
  }
}



async function allStationData (callback) {
  let query = `SELECT * FROM stationdata ORDER BY credit DESC`;
  try {
    connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error`);
        callback(err);
        // Return here to prevent further execution
        return;
      }
      connection.query(query, function (err, result, fields) {
        if (err) {
        }
        // console.log(result);
        callback(err, result);
      });
      conn.release();
      // conn.end();
    })

  } catch (error) {
    console.log(`An error orcur allStationData: ${error}`);
  }
}

//update member number
// Function to update member number in the database
async function updateMemberNumber(ip, newMemberNumber) {
  try {
      // Construct SQL query to update member number
      const query = `UPDATE stationdata SET member = ? WHERE ip = ?`;

      // Execute the query
      await connection.getConnection(function (err, conn) {
          if (err) {
              console.log(`getConnection error : ${err}`);
              throw err;
          }
          conn.query(query, [newMemberNumber, ip], function (err, result) {
              if (err) {
                  console.log(err);
                  throw err;
              }
              console.log(`Member number updated for station with IP ${ip}`);
          });
          conn.release();
      });
  } catch (error) {
      console.log(`An error occurred while updating member number: ${error}`);
      throw error;
  }
}








//CREATE STATION DATA RECORD 
async function createStation(machine, member, bet, credit, connect, display, status, aft, lastupdate, callback) {
  const checkDuplicateQuery = `SELECT * FROM stationdata WHERE machine = ? AND member = ?`;
  const checkDuplicateValues = [machine, member];
  const insertQuery = `INSERT INTO stationdata (machine, member, bet, credit, connect, display, status, aft, lastupdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`;
  const insertValues = [machine, member, bet, credit, connect, display, status, aft, lastupdate];
  try {
    await connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error : ${err}`)
      }
      // Check for duplicates
      connection.query(checkDuplicateQuery, checkDuplicateValues, function (err, duplicateResult) {
        if (err) {
          console.log(err);
          return callback(err, null);
        }

        if (duplicateResult.length > 0) {
          // Duplicate found, handle it as needed
          return callback({ error: 'Duplicate record found.', duplicateRecord: duplicateResult[0] }, null);
        }

        // No duplicate found, proceed with the insertion
        connection.query(insertQuery, insertValues, function (err, result, fields) {
          if (err) {
            console.log(err);
            return callback(err, null);
          }

          callback(null, result);
        });
      });
      conn.release();
    })

  } catch (error) {
    console.log(`An error orcur allStationData: ${error}`);
  }
}




//UPDATE STATION CREDIT BY MACHINE,MEMBER
async function updateStationCredit(machine, member, credit, callback) {
  const updateQuery = `UPDATE stationdata SET credit = ? WHERE machine = ? AND member = ?`;
  const updateValues = [credit, machine, member];
  try {
    await connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error : ${err}`);
        return callback(err, null);
      }
      // Execute the update query
      connection.query(updateQuery, updateValues, function (err, result, fields) {
        if (err) {
          console.log(err);
          return callback(err, null);
        }
        if (result.affectedRows === 0) {
          // No matching record found for update
          return callback({ error: 'No matching record found for update.' }, null);
        }
        // Update successful
        callback(null, { message: 'Record updated successfully' });
      });
      conn.release();
    });
  } catch (error) {
    console.log(`An error occurred in updateStationCredit: ${error}`);
    callback(error, null);
  }
}


// DELETE STATION DATA RECORD
async function deleteStation(machine, member, callback) {
  const deleteQuery = `DELETE FROM stationdata WHERE machine = ? AND member = ? AND status = 0`;
  const deleteValues = [machine, member];
  try {
    await connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error : ${err}`);
        return callback(err, null);
      }
      // Execute the delete query
      connection.query(deleteQuery, deleteValues, function (err, result, fields) {
        if (err) {
          console.log(err);
          return callback(err, null);
        }
        if (result.affectedRows === 0) {
          // No matching record found for deletion
          return callback({ error: 'No matching record found for deletion.' }, null);
        }
        // Deletion successful
        callback(null, { message: 'Record deleted successfully' });
      });
      conn.release();
    });
  } catch (error) {
    console.log(`An error occurred in deleteStation: ${error}`);
    callback(error, null);
  }
}

//UPDATE STATUS BY IP
async function updateConnectStatus(ip, newConnectValue, callback) {
  let updateQuery = `UPDATE stationdata SET connect = ? WHERE ip = ?`;
  try {
    await connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error : ${err}`);
        callback(err);
        return;
      }
      connection.query(updateQuery, [newConnectValue, ip], function (err, result) {
        if (err) {
          console.log(err);
          callback(err);
          return;
        }
        console.log(`Update successful for IP ${ip}. New connect value: ${newConnectValue}`);
        callback(null, result);
      });

      conn.release();
    });
  } catch (error) {
    console.log(`An error occurred in updateConnectStatus: ${error}`);
    callback(error);
  }
}




// UPDATE ENABLE BY IP
async function updateEnableStatus(ip, newEnableValue, callback) {
  let updateQuery = `UPDATE stationdata SET status = ? WHERE ip = ?`;
  try {
    await connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error : ${err}`);
        callback(err);
        return;
      }

      connection.query(updateQuery, [newEnableValue, ip], function (err, result) {
        if (err) {
          console.log(err);
          callback(err);
          return;
        }

        console.log(`Update successful for IP ${ip}. New enable value: ${newEnableValue}`);
        callback(null, result);
      });

      conn.release();
    });
  } catch (error) {
    console.log(`An error occurred in updateEnableStatus: ${error}`);
    callback(error);
  }
}




//UPDATe ENABLE FOR ALL
// UPDATE ENABLE FIELD FOR ALL ROWS
async function updateEnableAll(newEnableValue, callback) {
  let updateQuery = `UPDATE stationdata SET status = ?`;
  try {
    await connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error : ${err}`);
        callback(err);
        return;
      }

      connection.query(updateQuery, [newEnableValue], function (err, result) {
        if (err) {
          console.log(err);
          callback(err);
          return;
        }

        console.log(`Update successful for all rows. New enable value: ${newEnableValue}`);
        callback(null, result);
      });

      conn.release();
    });
  } catch (error) {
    console.log(`An error occurred in updateEnableAll: ${error}`);
    callback(error);
  }
}


async function addDisplayColumn(callback) {
  const alterTableQuery = 'ALTER TABLE stationdata ADD COLUMN display BOOLEAN DEFAULT true;';

  try {
    await connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error: ${err}`);
        callback(err);
        return;
      }

      connection.query(alterTableQuery, function (err, result, fields) {
        if (err) {
          console.log(`Error adding display column: ${err}`);
          callback(err);
          return;
        }

        console.log('Display column added successfully.');
        callback(null, result);
      });

      conn.release();
    });
  } catch (error) {
    console.log(`An error occurred in addDisplayColumn: ${error}`);
    callback(error);
  }
}

async function updateStatusByIP(ip, display, callback) {
  const updateQuery = `UPDATE stationdata SET display = ? WHERE ip = ?`;
  const values = [display, ip];
  try {
    await connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error: ${err}`);
        callback(err);
        return;
      }
      connection.query(updateQuery, values, function (err, result, fields) {
        if (err) {
          console.log(`Error updating status: ${err}`);
          callback(err);
          return;
        }
        // console.log(`Status updated successfully for IP ${ip}`);
        callback(null, result);
      });
      conn.release();
    });
  } catch (error) {
    console.log(`An error occurred in updateStatusByIP: ${error}`);
    callback(error);
  }
}





async function findStationData(callback) {
  // let query = `SELECT * FROM stationdata`;
  let query = `SELECT * FROM stationdata WHERE connect = 1 ORDER BY credit DESC LIMIT 10`;

  try {
    await connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error : ${err}`)
      }
      connection.query(query, function (err, result, fields) {
        if (err) (
          console.log(err)
        );
        // console.log(result);
        callback(err, result)
      });
      conn.release();
    })

  } catch (error) {
    console.log(`An error orcur findFrameDateCustomer: ${error}`);
  }
}


async function findData(callback) {
  let query = `SELECT credit FROM stationdata WHERE connect = 1 ORDER BY credit DESC LIMIT 10`;
  try {
    await connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error : ${err}`)
      }
      connection.query(query, function (err, result, fields) {
        if (err) (
          console.log(err)
        );
        // console.log(result);
        callback(err, result)
      });
      conn.release();
    })

  } catch (error) {
    console.log(`An error orcur findData: ${error}`);
  }
}

async function findDataNumber(callback) {
  let query = `SELECT credit, member FROM stationdata WHERE connect = 1 ORDER BY credit DESC LIMIT 10`;
  try {
    await connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error : ${err}`)
      }
      connection.query(query, function (err, result, fields) {
        if (err) (
          console.log(err)
        );
        //  console.log(result);
        callback(err, result)
      });
      conn.release();
    })

  } catch (error) {
    console.log(`An error orcur findData: ${error}`);
  }
}

async function addStationData(machine, member, bet, credit, connect, status, aft, lastupdate, callback) {
  const query = `INSERT INTO stationdata (machine, member, bet, credit, connect, status, aft, lastupdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [machine, member, bet, credit, connect, status, aft, lastupdate];
  try {
    await connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error : ${err}`)
      }
      connection.query(query, values, function (err, result, fields) {
        if (err) (
          console.log(err)
        );
        callback(err, result)
      });
      conn.release();
    })

  } catch (error) {
    console.log(`An error orcur findFrameDateCustomer: ${error}`);
  }
}
async function addStationDataWithIP(ip, machine, member, bet, credit, connect, status, aft, lastupdate, callback) {
  const query = `INSERT INTO stationdata (ip,machine, member, bet, credit, connect, status, aft, lastupdate) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [ip, machine, member, bet, credit, connect, status, aft, lastupdate];
  try {
    await connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error : ${err}`)
      }
      connection.query(query, values, function (err, result, fields) {
        if (err) (
          console.log(err)
        );
        callback(err, result)
      });
      conn.release();
    })

  } catch (error) {
    console.log(`An error orcur findFrameDateCustomer: ${error}`);
  }
}

async function updateStationData(member, credit, callback) {
  const query = `UPDATE stationdata SET  credit = ? WHERE member = ?`;
  const values = [credit, member];

  try {
    await connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error: ${err}`);
        callback(err, null);
      } else {
        connection.query(query, values, function (err, result, fields) {
          if (err) {
            console.log(err);
            callback(err, null);
          } else {
            callback(null, result);
          }
        });
        conn.release();
      }
    });
  } catch (error) {
    console.log(`An error occurred in updateStationData ${error}`);
    callback(error, null);
  }
}

async function deleteStationDataAll(callback) {
  const query = `DELETE FROM stationdata`;
  try {
    await connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error: ${err}`);
        callback(err, null);
        return;
      }
      connection.query(query, function (err, result) {
        conn.release();
        if (err) {
          console.log(err);
          callback(err, null);
          return;
        }
        callback(null, result);
      });
    });
  } catch (error) {
    console.log(`An error occurred in deleteStationDataAll: ${error}`);
    callback(error, null);
  }
}



async function deleteStationData(ip, callback) {
  const query = `DELETE FROM stationdata WHERE ip = ?`;
  try {
    await connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error: ${err}`);
        callback(err, null);
        return;
      }

      connection.query(query, [ip], function (err, result) {
        conn.release();

        if (err) {
          console.log(err);
          callback(err, null);
          return;
        }

        callback(null, result);
      });
    });
  } catch (error) {
    console.log(`An error occurred in deleteStationData: ${error}`);
    callback(error, null);
  }
}



async function findSetting(callback) {
  let query = `SELECT * FROM setting`;
  try {
    await connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error : ${err}`)
      }
      connection.query(query, function (err, result, fields) {
        if (err) (
          console.log(err)
        );
        callback(err, result)
      });
      conn.release();
    })

  } catch (error) {
    console.log(`An error orcur findSetting: ${error}`);
  }
}


// Function to find settings and emit them to the client
async function findSettingSocket(name, io) {
  let query = `SELECT * FROM setting`;
  try {
      await connection.getConnection(function (err, conn) {
          if (err) {
              console.log(`getConnection error : ${err}`);
              return;
          }
          connection.query(query, function (err, result, fields) {
              if (err) {
                  console.log(err);
                  return;
              }
              // Emit the result to the client
              io.emit(name, result);
          });
          conn.release();
      });
  } catch (error) {
      console.log(`An error occurred in findSetting: ${error}`);
  }
}




async function updateSetting(settingData, callback) {
  let query = 'UPDATE setting SET ';
  let fields = [];
  
  // Dynamically build the query based on the fields in settingData
  for (const [key, value] of Object.entries(settingData)) {
    // Skip 'gametext' since it will be used in the WHERE condition
    if (key === 'gametext') continue;
    // Convert datetime fields to MySQL format
    if (key === 'lastupdate' && typeof value === 'string') {
      const mysqlDateTime = new Date(value).toISOString().slice(0, 19).replace('T', ' ');
      fields.push(`${key} = '${mysqlDateTime}'`);
    } else {
      fields.push(`${key} = ${typeof value === 'string' ? `'${value}'` : value}`);
    }
  }
  // Join the fields to form the SET part of the query
  query += fields.join(', ');
  // Add a condition to update only where 'gametext' matches
  if (settingData.gametext) {
    query += ` WHERE gametext = '${settingData.gametext}';`;
  } else {
    return callback(new Error('Missing gametext for update condition'), null);
  }

  try {
    await connection.getConnection(function (err, conn) {
      if (err) {
        console.log(`getConnection error : ${err}`);
        callback(err, null);
        return;
      }
      connection.query(query, function (err, result) {
        if (err) {
          console.log(`Update error: ${err}`);
          callback(err, null);
        } else {
          callback(null, result);
        }
      });
      conn.release();
    });
  } catch (error) {
    console.log(`An error occurred in updateSetting: ${error}`);
    callback(error, null);
  }
}




module.exports = {
  findBetNumber: findBetNumber,
  findStationData: findStationData,
  addStationData: addStationData,
  deleteStationData: deleteStationData,
  findData: findData,
  //setting config
  findSetting:findSetting,
  findSettingSocket:findSettingSocket,
  updateSetting:updateSetting,
  //setting config 
  allStationData: allStationData,
  findDataNumber: findDataNumber,
  deleteStationDataAll: deleteStationDataAll,
  updateStationData: updateStationData,

  addStationDataWithIP: addStationDataWithIP,

  updateConnectStatus: updateConnectStatus,
  updateEnableStatus:updateEnableStatus,
  updateEnableAll:updateEnableAll,
  updateStatusByIP: updateStatusByIP,
  addDisplayColumn: addDisplayColumn,
  createStation: createStation,
  deleteStation:deleteStation,
  updateStationCredit:updateStationCredit,
  updateMemberNumber:updateMemberNumber,

}