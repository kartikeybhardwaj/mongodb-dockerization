db.auth("admin-user", "admin-password");

db = db.getSiblingDB("appdb");

db.createUser({
    user: "app-user",
    pwd: "app-password",
    roles: [{
        role: "dbOwner",
        db: "appdb",
    }],
});
