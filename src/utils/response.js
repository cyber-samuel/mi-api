const success = (res, data = null, message = 'OK', status = 200) => {
  return res.status(status).json({ success: true, data, message });
};

const error = (res, message = 'Error interno', status = 500, data = null) => {
  return res.status(status).json({ success: false, data, message });
};

module.exports = { success, error };
