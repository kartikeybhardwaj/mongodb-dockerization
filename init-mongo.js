db.createUser({
    "user": "kart",
    "pwd": "oon",
    "roles": [{
        "role": "userAdminAnyDatabase",
        "db": "admin"
    }, "readWriteAnyDatabase"]
});
