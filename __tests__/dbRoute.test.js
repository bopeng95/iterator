const request = require('supertest');
const { query } = require('../server/models/pmModel');
const path = require('path');
const fs = require('fs');
const app = require('../server/server');

const remove = fs.readFileSync(path.join(__dirname, '../scripts/db.remove.sql'), { encoding: 'utf-8' }).split('\n');
const init = fs.readFileSync(path.join(__dirname, '../scripts/db.init.sql'), { encoding: 'utf-8' }).split('\n');

describe('Testing routes', () => {
    describe('/db', () => {
        beforeEach(async () => {
            const p = init.map(async item => {
                return await query({ text: item });
            }); await Promise.all(p);
        });
        describe('/allUsers', () => {
            it('Responds with 200 and content-type to be application/json', () => {
                return request(app)
                    .get('/db/allUsers')
                    .expect('Content-Type', /application\/json/)
                    .expect(200);
            });
        });
        describe('/allProjects', () => {
            it('Responds with 200 and content-type to be application/json', () => {
                return request(app)
                    .get('/db/allProjects')
                    .expect('Content-Type', /application\/json/)
                    .expect(200);
            });
        });
        describe('/project', () => {
            it('creates the project with status 200', () => {
                return request(app)
                    .post('/db/project')
                    .send({ username: 'kim', name: 'test project', description: 'tests decription is here' })
                    .expect('Content-Type', /text\/html/)
                    .expect(200);
            });
            it('returns proper response after success post into projects and is stored in database', () => {
                const user = 'kim', name = 'test';
                return request(app)
                    .post('/db/project')
                    .send({ username: user, name: name, description: 'tests decription is here' })
                    .then(data => {
                        expect(data.text).toBe(`Project ${name} made by ${user} has been made and stored`);
                        return request(app).get('/db/allProjects')
                        .then(state => {
                            expect(JSON.parse(state.text)[0].name).toBe(name);
                            expect(state.status).toBe(200);
                        })
                    });
            });
        });
        describe('/getProjects', () => {
            it('userProjects contains the correct mapping after storing a project by an user', () => {
                const user = 'kim', name = 'test';
                return request(app)
                    .post('/db/project')
                    .send({ username: user, name: name, description: 'tests decription is here' })
                    .then(data => {
                        return request(app).post('/db/getProjects')
                        .send({ username: user })
                        .then(state => {
                            const result = JSON.parse(state.text)[0];
                            expect(result.admin).toBe('1');
                            expect(result.name).toBe(name);
                            expect(state.status).toBe(200);
                        })
                    });
            });
        });
        afterEach(async () => {
            const p = remove.map(async item => {
                return await query({ text: item })
            }); await Promise.all(p);
        });
    });
})