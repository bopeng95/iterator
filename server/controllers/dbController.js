const { query } = require('../models/pmModel');

module.exports = {
    //function to check if email exists
    getOneUserByUsername: (user) => {
        //return user where email is email argument
        return query({
            text: `select username, password from users where username = ($1)`,
            values: [user]
        }).then(data => {
            return new Promise((resolve, reject) => {
                resolve(data.rows[0]);
            })
        })
    },
    //function to create / insert a user into the database
    createUser: (user) => {
        //return user inserted with id
        return query({
            text: 'insert into users (username, password) values ($1, $2)',
            values: [user.user, user.password]
        }).then(data => new Promise((resolve, reject) => resolve(data)));
    },
    allUsers: async (req, res) => {
        const users = await query({
            text: 'select * from users'
        }).then(data => data.rows);
        res.json(users);
    },
    allProjects: async (req, res) => {
        const projects = await query({
            text: 'select * from projects'
        }).then(data => data.rows);
        res.json(projects);
    },
    getProjects: async (req, res) => {
        const { username } = req.body;
        const userId = await query({
            text: 'select id from users where username = ($1)',
            values: [username]
        }).then(data => data.rows[0].id);
        const projectIds = await query({
            text: 'select project_id, admin from "userProjects" where user_id = ($1)',
            values: [userId]
        }).then(data => data.rows);
        const promiseArr = [];
        for(let i = 0; i < projectIds.length; i++) {
            const p = await query({
                text: 'select name, description from projects where id = ($1)',
                values: [projectIds[i].project_id]
            }).then(data => {
                data.rows[0].admin = projectIds[i].admin;
                return data.rows[0];
            });
            promiseArr.push(p);
        }
        const result = Promise.all(promiseArr);
        result.then(data => res.json(data));
    },
    setProject: async (req, res) => {
        const { username, name, description } = req.body;
        const userId = await query({
            text: `select id from users where username = ($1)`,
            values: [username]
        }).then(data => data.rows[0].id);
        const projectId = await query({
            text: 'insert into projects (name, description) values ($1, $2) returning id',
            values: [name, description]
        }).then(data => data.rows[0].id);
        await query({
            text: 'insert into "userProjects" (user_id, project_id, admin) values ($1, $2, $3)',
            values: [userId, projectId, 1]
        });
        res.send(`Project ${name} made by ${username} has been made and stored`);
    },
    addMembers: async (req, res) => {
        const { name, list } = req.body;
        const projectId = await query({
            text: 'select id from projects where name = ($1)',
            values: [name]
        }).then(data => data.rows[0].id);
        const promiseArr = [];
        for(let i = 0; i < list.length; i++) {
            const p = await query({
                text: 'select id from users where username = ($1)',
                values: [list[i]]
            }).then(data => data.rows[0].id);
            promiseArr.push(p);
        }
        const result = await Promise.all(promiseArr);
        const addArr = [];
        for(let i = 0; i < result.length; i++) {
            const p = await query({
                text: 'insert into "userProjects" (user_id, project_id, admin) values ($1, $2, $3)',
                values: [result[i], projectId, 0]
            }); addArr.push(p);
        }
        await Promise.all(addArr);
        res.send(`Added ${list} into project ${name}`);
    }
};