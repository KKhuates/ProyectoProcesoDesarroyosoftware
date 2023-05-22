const controller = {};
controller.list = (req,res) =>{
    req.getConnection((err,conn)=> {
        conn.query('SELECT * FROM usuario', (err, customers) => {
            if (err) {
                res.json(err);
            }
            res.render('customers',{
                data: customers
            });
        });
    } );
};

module.exports= controller;