const mysql = require('mysql');
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const url = require('url');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 5000;

app.listen(port);

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "librarydb",
  port: "3306",
  dateStrings: true
});

con.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

app.route('/book')
  .post((req, res) => {
    console.log(req.params);
    con.query(`insert into book(isbn, title, pubYear, numpages, pubName) values(\'${req.body.isbn}\', \'${req.body.title}\', ${req.body.pubYear}, ${req.body.numPages}, \'${req.body.pubName}\');`);
    console.log(req.body);
    res.send({ status: 'succ' });
  })
  .get((req, res) => {
    var qdata = JSON.parse(req.query.query);
    console.log(qdata);
    var selectQuery = "select book.isbn as \"ISBN\", title as \"Title\", pubYear as \"Published on\", numpages as \"No. of Pages\", pubName as \"Published by\", count(copies.isbn) as \"No. of Copies\" from book inner join copies on book.ISBN=copies.ISBN"
    const orderBy = qdata["by"];
    delete qdata["by"];
    if (Object.keys(qdata).length !== 0) {
      selectQuery += " where"
      for (x in qdata) {
        if (x === "isbn" || x === "title" || x === "pubName") {
          selectQuery += ` book.${x} like '%${qdata[x]}%' and`;
        }
        else {
          selectQuery += ` book.${x} =  ${qdata[x]}  and`;
        }
      }
      selectQuery = selectQuery.substring(0, selectQuery.length - 4);
    }

    selectQuery += " group by book.ISBN";
    if(orderBy !== undefined) selectQuery += ` order by ${orderBy}`;
    selectQuery += ';';

    console.log(selectQuery);
    con.query(selectQuery, (err, result, fields) => {
      if (err) throw err;
      namesObj = {};
      orgNamesObj = {};
      prim_key=["ISBN"];
      fields.map((obj ,i) => {
        namesObj[i] = obj.name;
        orgNamesObj[i] = obj.orgName;
      });
      res.json({"prim_key":prim_key,"orgName":orgNamesObj,"names":namesObj,"result": result});
    });
  })
  .delete((req, res) => {
    const query = JSON.parse(req.query[0])
    console.log(query.ISBN)
    const deleteQuery = `delete from book where book.isbn = ${query.ISBN};`
    con.query(deleteQuery, (err) => {
      if (err) throw err;
      res.json({});
    });
  })

dateFrontToBack = (input) => {
  return `${input.substring(6,10)}-${input.substring(0,2)}-${input.substring(3,5)}`
};

dateBackToFront = (input) => {
  return `${input.substring(5,7)}/${input.substring(8,10)}/${input.substring(0,4)}`
};

app.route('/author')
  .post((req, res) => {
    console.log(req.params);
    req.body.aBirthdate = dateFrontToBack(req.body.aBirthdate);

    con.query(`insert into author(ID, aFirst, aLast, aBithdate) values(\'${req.body.ID}\', \'${req.body.aFirst}\', \'${req.body.aLast}\', \'${req.body.aBirthdate}\');`);
    console.log(req.body);
    res.send({ status: 'succ' });
  })
  .get((req, res) => {
    var qdata = JSON.parse(req.query.query);
    console.log(qdata);
    var selectQuery = "select author.ID as \"ID\", aFirst as \"First Name\", aLast as \"Last Name\", aBirthdate as \"Date of Birth\", count(*) as \"# Written Books\" from author inner join written_by on author.ID=written_by.ID";
    const orderBy = qdata["by"];
    delete qdata["by"];
    if (Object.keys(qdata).length !== 0) {
      selectQuery += " where"
      for (x in qdata) {
        if (x === "ID") {
          selectQuery += ` author.${x} =  ${qdata[x]}  and`;
        }
        else {
          selectQuery += ` author.${x} like '%${qdata[x]}%' and`;
        }
      }
      selectQuery = selectQuery.substring(0, selectQuery.length - 4);
    }

    selectQuery += " group by author.ID";
    if(orderBy !== undefined) selectQuery += ` order by author.${orderBy}`;
    selectQuery += ';';

    console.log(selectQuery);
    con.query(selectQuery, (err, result, fields) => {
      if (err) throw err;
      namesObj = {};
      orgNamesObj = {};
      prim_key=["ID"];
      fields.map((obj ,i) => {
        namesObj[i] = obj.name;
        orgNamesObj[i] = obj.orgName;
      });
      result.forEach(el=> {
        el["Date of Birth"] = dateBackToFront(el["Date of Birth"]);
      });
      res.json({"prim_key":prim_key,"orgName":orgNamesObj,"names":namesObj,"result": result});
    });
  })
  .delete((req, res) => {
    const query = JSON.parse(req.query[0])
    const deleteQuery = `delete from author where author.ID = ${query.ID};`
    con.query(deleteQuery, (err) => {
      if (err) throw err;
      res.json({});
    });
  })
  
  app.route('/member')
    .post((req, res) => {
      console.log(req.params);
      req.body.aBirthdate = dateFrontToBack(req.body.aBirthdate);
  
      con.query(`insert into member(ID, mFirst, mLast, street, streetNumber, postalCode, mBirthdate) values(\'${req.body.ID}\', \'${req.body.mFirst}\', \'${req.body.mLast}\', \'${street}\', ${streetNumber}, \'${postalCode}\', \'${req.body.aBirthdate}\');`);
      console.log(req.body);
      res.send({ status: 'succ' });
    })
    .get((req, res) => {
      var qdata = JSON.parse(req.query.query);
      console.log(qdata);
      var selectQuery = "select member.ID as \"ID\", mFirst as \"First Name\", mLast as \"Last Name\", street as \"Street\", streetNumber as \"Street Number\", postalCode as \"Postal Code\", mBirthdate as \"Date of Birth\", count(*) as \"# Written Books\" from member inner join  borrows on member.ID=borrows.ID";
      const orderBy = qdata["by"];
      delete qdata["by"];
      if (Object.keys(qdata).length !== 0) {
        selectQuery += " where"
        for (x in qdata) {
          if (x === "ID" || x === "streetNumber") {
            selectQuery += ` member.${x} =  ${qdata[x]}  and`;
          }
          else {
            selectQuery += ` member.${x} like '%${qdata[x]}%' and`;
          }
        }
        selectQuery = selectQuery.substring(0, selectQuery.length - 4);
      }
  
      selectQuery += " group by member.ID";
      if(orderBy !== undefined) selectQuery += ` order by member.${orderBy}`;
      selectQuery += ';';
  
      console.log(selectQuery);
      con.query(selectQuery, (err, result, fields) => {
        if (err) throw err;
        namesObj = {};
        orgNamesObj = {};
        prim_key=["ID"];
        fields.map((obj ,i) => {
          namesObj[i] = obj.name;
          orgNamesObj[i] = obj.orgName;
        });
        result.forEach(el=> {
          el["Date of Birth"] = dateBackToFront(el["Date of Birth"]);
        });
        res.json({"prim_key":prim_key,"orgName":orgNamesObj,"names":namesObj,"result": result});
      });
    })
    .delete((req, res) => {
      const query = JSON.parse(req.query[0])
      const deleteQuery = `delete from member where member.ID = ${query.ID};`
      con.query(deleteQuery, (err) => {
        if (err) throw err;
        res.json({});
      });
    })