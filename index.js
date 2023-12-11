const express = require("express")
const { ConnectionPool } = require('mssql');
const cors = require("cors")
const fs = require("fs")
const admZip = require("adm-zip")

const app = express()
app.use(express.json());
app.use(cors());

const config = JSON.parse(fs.readFileSync("config.json"))

const zip = new admZip()

app.get("/users", async (req, res) => {
    try {
        const pool = await new ConnectionPool(config).connect()
        const request = pool.request()
        const sorgu = "SELECT ef_title, ef_identifier FROM dbt_efatura_userlist"

        const result = await request.query(sorgu)
        const sonuc = JSON.stringify(result.recordset)

        fs.writeFile("users.json", sonuc, (err) => {
            if (err) {
                console.log(err);
            } else {
                zip.addLocalFile("users.json")
                zip.writeZip("users.zip", (err) => {
                    if (!err) {
                        console.log("Zip dosyası oluşturuldu");
                        const dosya = "users.zip"
                        res.download(dosya, ()=> {
                            fs.unlink("users.zip", (err) => {
                                if(!err) {
                                    console.log("zip dosyası silindi");
                                } else {
                                    console.log("silinemedi", err);
                                }
                            })
                        })
                    } else {
                        console.log("başarısız: ", err);
                    }
                })
            }
        })



        pool.close()

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Başaramadık Ağabey", error: error })
    }
})



const port = 3001
app.listen(port, () => {
    console.log(`${port} portunda çalışıyor`);
})