const { sql } = require('../config/db');

const authRepository = {
    registerInternal: async (username, password, role) => {
        const request = new sql.Request();
        request.input('USERNAME', sql.VarChar(50), username);
        request.input('PASSWORD', sql.NVarChar(255), password);
        request.input('ROLE', sql.VarChar(20), role);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_RegisterUserInternal');
        return {
            status: result.output.StatusMessage,
            data: result.recordset ? result.recordset[0] : null
        };
    },

    login: async (username, password) => {
        const request = new sql.Request();
        request.input('USERNAME', sql.VarChar(50), username);
        request.input('PASSWORD', sql.NVarChar(255), password);
        request.output('StatusMessage', sql.NVarChar(255));

        const result = await request.execute('sp_LoginUser');
        return {
            status: result.output.StatusMessage,
            user: result.recordset && result.recordset.length > 0 ? result.recordset[0] : null
        };
    }
};

module.exports = authRepository;
