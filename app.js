const express = require("express");

const app = express();
app.use(express.json());
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbpath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeserveranddb = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000/");
    });
  } catch (e) {
    console.log(`${e}`);
    process.exit(1);
  }
};

initializeserveranddb();

const onlystatus = (status, priority, search_q) => {
  if (priority === undefined && search_q === undefined) {
    return ["status_given", status];
  } else if (status === undefined && search_q === undefined) {
    return ["priority_given", priority];
  } else if (search_q === undefined) {
    return ["priorityandstatus", status, priority];
  } else if (search_q !== undefined) {
    return ["search", search_q];
  }
};

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q } = request.query;
  result = onlystatus(status, priority, search_q);
  console.log(result);

  if (result[0] === "status_given") {
    const query = `select * from todo where status like "${result[1]}"`;
    const connect = await db.all(query);
    response.send(connect);
  } else if (result[0] === "priority_given") {
    const query = `select * from todo where priority like "${result[1]}"`;
    const connect = await db.all(query);
    response.send(connect);
  } else if (result[0] === "priorityandstatus") {
    const query = `select * from todo where priority like "${result[2]}" and status like "${result[1]}"`;
    const connect = await db.all(query);
    response.send(connect);
  } else if (result[0] === "search") {
    const query = `select * from todo where todo like "%${result[1]}%"`;
    const connect = await db.all(query);
    response.send(connect);
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `select * from todo where id=${todoId};`;
  const data = await db.get(query);
  response.send(data);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const query = `insert into todo (id,todo,priority,status) values (${id},"${todo}","${priority}","${status}");`;
  await db.run(query);
  response.send("Todo Successfully Added");
});

const tobeupdated = (status, priority, todo) => {
  if (priority === undefined && todo === undefined) {
    return ["status", status];
  } else if (status === undefined && todo === undefined) {
    return ["priority", priority];
  } else if (status === undefined && priority === undefined) {
    return ["todo", todo];
  }
};

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  result = tobeupdated(status, priority, todo);
  console.log(result);

  if (result[0] === "status") {
    const query = `update todo set status="${result[1]}" where id=${todoId}`;
    await db.run(query);
    response.send("Status Updated");
  } else if (result[0] === "priority") {
    const query = `update todo set priority="${result[1]}" where id=${todoId}`;
    await db.run(query);
    response.send("Priority Updated");
  } else if (result[0] === "todo") {
    const query = `update todo set todo="${result[1]}" where id=${todoId};`;
    await db.run(query);
    response.send("Todo Updated");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `delete from todo where id=${todoId};`;
  await db.run(query);
  response.send("Todo Deleted");
});

module.exports = app;
