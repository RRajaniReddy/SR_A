const colors = require("colors");
const request = require('request');
const cds = require('@sap/cds');
const { SELECT, INSERT } = cds.ql;

module.exports = (srv) => {
    async function getNextId(AssessmentRequests) {
        const result = await SELECT.one(AssessmentRequests).orderBy({ ID: 'desc' })
        //console.log(result)
        return result ? result.ID + 1 : 1
    }

    srv.before("CREATE", "AssessmentRequests", async req => {
        req.data.ID = req.data.ID || await getNextId("CatalogService.AssessmentRequests")
        //console.log(req.data.ID);
    })


    //////////////////////////////////////WORKFLOW LOGIC STARTS/////////////////////////////////////////////

    const { ProjectApprovalGroupParticipants, InternalUserMasterTable, Graders } = srv.entities
    async function getEmails(AssessmentRequests) {
        const result1 = await SELECT.one(AssessmentRequests).orderBy({ ID: 'desc' })
        let projectID = result1.ID
        let requestorFullName = (result1.RequestorName).split(" ");
        let requestorFirstName = requestorFullName[0];
        let requestorLastName = requestorFullName[1];
        //console.log(requestorFullName,requestorFirstName,requestorLastName);
        const requestorEmail = await SELECT.columns`emailAddress as email`.from(InternalUserMasterTable).where({ LoginID: result1.RequestorID })
        //console.log(requestorEmail[0].email);
        let requestorEmailID = requestorEmail[0].email;
        //const approver = await SELECT.columns`UserMail as SecondApprover`.from(ProjectApprovalGroupParticipants).where({ ID: projectID })
        const approver = await SELECT.columns`UserMail as SecondApprover,UserMail as SecondApprover_mail,firstName as SecondApprover_fname,lastName as SecondApprover_lname`.from(Graders).where({ ID: projectID });
        //,UserMail as SecondApprover_mail,firstName as SecondApprover_fname,lastName as SecondApprover_lname
        console.log(approver);
        let supplier = result1.ResponderEmail
        const name = await SELECT.columns`firstname as firstName,lastname as lastName`.from(InternalUserMasterTable).where({ emailAddress: supplier })
        approver.unshift({ 'projectID': projectID });
        approver.unshift({ 'name': name });
        approver.unshift({ 'supplier': supplier });
        approver.unshift({ 'requestorFirstName': requestorFirstName });
        approver.unshift({ 'requestorLastName': requestorLastName });
        approver.unshift({ 'requestorEmailID': requestorEmailID });
        //console.log(approver);
        return result1 ? approver : 1
    }
    srv.after("CREATE", "AssessmentRequests", async req => {

        if (req.Project_Status === 'Open') {
            let SecondApprovers = await getEmails("CatalogService.AssessmentRequests");
            let req_email = SecondApprovers[0].requestorEmailID
            let req_lname = SecondApprovers[1].requestorLastName
            let req_fname = SecondApprovers[2].requestorFirstName
            let suppliermail = SecondApprovers[3].supplier
            let fullname = SecondApprovers[4].name
            let projectID1 = SecondApprovers[5].projectID
            let deadline = req.Deadline;
            console.log(req_email, req_lname, req_fname, suppliermail, fullname, projectID1, deadline)

            SecondApprovers.shift();
            SecondApprovers.shift();
            SecondApprovers.shift();
            SecondApprovers.shift();
            SecondApprovers.shift();
            SecondApprovers.shift();

            console.log(SecondApprovers)
            //First Scenario (when assessment request is created)
            let token;
            var getToken = {
                method: 'POST',
                url: 'https://7dcdf1e5trial.authentication.us10.hana.ondemand.com/oauth/token?grant_type=client_credentials',
                headers:
                {
                    authorization: 'Basic c2ItY2xvbmUtMWVlMDI0MjUtNzRjZi00ZTU5LWFhNzYtMTg5YWY2M2E2ZmI0IWIzOTA1NXx3b3JrZmxvdyFiMTc3NDpkOGIwM2VjMi04NWY4LTQyMDMtYmI1Mi1jMTk0Mzg3ZjVjMzckRUtDSWZQVXREWFZOeTMtVlNiUDFLWkx1RDdLUm9jZVZaNDNMRTZkTFptOD0='
                },
                body: {
                },
                json: true

            };
            request(getToken, function (error, response, body) {
                if (error) { }//throw new Error(error)
                else {
                    let test = [{
                        "definitionId": "myworkflow.myworkflow",
                        "context":
                        {
                            "buyerData":
                            {
                                "firstName": req_fname,
                                "lastName": req_lname,
                                "Requester_mail_id": req_email,
                                "first_approver_mail_id": suppliermail,
                                "first_approver": suppliermail,
                                "first_approver_fname": fullname[0].firstName,
                                "first_approver_lname": fullname[0].lastName,
                                "address": "Mumbai",
                                "requestID": projectID1,
                                "deadLine": "P0Y0M1DT0H0M0S"//deadline
                            },
                            SecondApprovers
                        }
                    }]
                    console.log(test);
                    token = body.access_token
                    let access_token = 'Bearer ' + token;
                    var options = {
                        method: 'POST',
                        url: 'https://api.workflow-sap.cfapps.us10.hana.ondemand.com/workflow-service/rest/v1/workflow-instances',
                        headers:
                        {
                            'postman-token': 'c460ea7e-6f8f-69ab-fade-2bb9c53978c3',
                            'cache-control': 'no-cache',
                            authorization: access_token,
                            'content-type': 'application/json'
                        },
                        body: {
                            definitionId: 'myworkflow.myworkflow',
                            context:
                            {
                                buyerData:
                                {
                                    firstName: req_fname,
                                    lastName: req_lname,
                                    Requester_mail_id: req_email,
                                    first_approver_mail_id: suppliermail,
                                    first_approver: suppliermail,
                                    first_approver_fname: fullname[0].firstName,
                                    first_approver_lname: fullname[0].lastName,
                                    address: "Mumbai",
                                    requestID: projectID1,
                                    deadLine: "P0Y0M1DT0H0M0S"//deadline
                                },
                                SecondApprovers

                            }
                        },
                        json: true
                    };
                    //console.log(SecondApprovers);
                    request(options, function (error, response, body) {
                        if (error) throw new Error(error)
                        /* var DeleteURL = 'https://supplierengagementsurvey-srv.cfapps.eu10.hana.ondemand.com/v2/catalog/AssessmentRequests(ID=' + projectID1 + ')';
                         var DeleteAssessmentRequest = {
                             method: 'DELETE',
                             url: DeleteURL,
                             headers:
                             {
                                 'content-type': 'application/json'
                             },
                             body: {
                             },
                             json: true
                         };
                         request(DeleteAssessmentRequest, function (error, response, body) {
                             if (error) { 
                 
                                 let errormsg = "Assessment Request Not created.Check the connection and try again after sometime";
                                 //console.log(req);
                                 console.log(req);
                                 //req.reject(400, errormsg);
                                 //console.log(response);
                                 //response.reject(400, errormsg);
                                 // return {
                                 //    message: errormsg
                                 // }
                             }
                         });
                
                     }*/
                        else {
                            var workflowID = body.id;
                            //insert workflow id and project id in table
                            var insertData = {
                                method: 'POST',
                                url: 'https://supplierengagementsurvey-srv.cfapps.eu10.hana.ondemand.com/v2/catalog/Workflow',
                                headers:
                                {
                                    'content-type': 'application/json'
                                },
                                body: {
                                    "project_ID": projectID1,
                                    "workflow_ID": workflowID
                                },
                                json: true

                            };
                            request(insertData, function (error, response, body) {
                                if (error) {
                                    console.log("workflow id failed to insert in table")
                                }//throw new Error(error)
                                else {
                                    console.log(body);
                                    console.log(projectID1, workflowID);
                                    console.log("AssessmentRequest created, mail has been sent to responder")
                                }
                            });
                        }
                    });
                }
            });
        }
    });

    //second scenario (when responder submits the response)
    //srv.after("CREATE", "ResponseDetails", async req => {
    srv.after("UPDATE", "AssessmentRequests", async req => {
        if (req.Project_Status === 'OpenWithApprover') {
            const { Workflow } = cds.entities('my.Survey');
            const workflow_ID = await SELECT.columns`workflow_ID as ID`.from(Workflow).where({ project_ID: req.ID })
            let InstanceID = workflow_ID[0].ID;
            //console.log(workflow_ID);
            var url1 = 'https://api.workflow-sap.cfapps.us10.hana.ondemand.com/workflow-service/rest/v1/workflow-instances/' + InstanceID + '/execution-logs';

            let token1;
            //get token
            var getToken1 = {
                method: 'POST',
                url: 'https://7dcdf1e5trial.authentication.us10.hana.ondemand.com/oauth/token?grant_type=client_credentials',
                headers:
                {
                    authorization: 'Basic c2ItY2xvbmUtMWVlMDI0MjUtNzRjZi00ZTU5LWFhNzYtMTg5YWY2M2E2ZmI0IWIzOTA1NXx3b3JrZmxvdyFiMTc3NDpkOGIwM2VjMi04NWY4LTQyMDMtYmI1Mi1jMTk0Mzg3ZjVjMzckRUtDSWZQVXREWFZOeTMtVlNiUDFLWkx1RDdLUm9jZVZaNDNMRTZkTFptOD0='
                },
                body: {
                },
                json: true

            };
            request(getToken1, function (error, response, body) {
                if (error) throw new Error(error)
                else {
                    token1 = body.access_token
                    let access_token1 = 'Bearer ' + token1;

                    // get task id related to workflow id
                    console.log(url1);
                    console.log("get task id related to workflow id");
                    var options1 = {
                        method: 'GET',
                        url: url1,
                        headers:
                        {
                            'postman-token': 'c460ea7e-6f8f-69ab-fade-2bb9c53978c3',
                            'cache-control': 'no-cache',
                            authorization: access_token1,
                            'content-type': 'application/json'
                        },
                        body: {
                        },
                        json: true
                    };
                    request(options1, function (error, response, body) {
                        if (error) throw new Error(error)
                        else {
                            let taskID;
                            for (let i = 0; i < body.length; i++) {
                                if (body[i].type == 'USERTASK_CREATED') {
                                    taskID = body[3].taskId;
                                }
                            }
                            console.log("taskID", taskID);
                            //console.log(access_token1);
                            var url2 = 'https://api.workflow-sap.cfapps.us10.hana.ondemand.com/workflow-service/rest/v1/task-instances/' + taskID;
                            var options2 = {
                                method: 'PATCH',
                                url: url2,
                                headers:
                                {
                                    'postman-token': 'c460ea7e-6f8f-69ab-fade-2bb9c53978c3',
                                    'cache-control': 'no-cache',
                                    authorization: access_token1,
                                    'content-type': 'application/json'
                                },
                                body: {
                                    "context": {
                                        "approve": true
                                    },
                                    "status": "COMPLETED"
                                },
                                json: true
                            };
                            request(options2, function (error, response, body) {
                                if (error) throw new Error(error)
                                else {
                                    console.log("Responder has submitted the response. Mail sent to the approver")
                                }
                            })
                        }
                    });
                }
            });
        }
    });

    //Third scenario (after approver grading)
    srv.after("CREATE", "ApproverDetails", async req => {
        const { Workflow } = cds.entities('my.Survey');
        const { ProjectApprovalGroupParticipants } = cds.entities('my.Views');
        const workflow_ID1 = await SELECT.columns`workflow_ID as ID`.from(Workflow).where({ project_ID: req.ProjectID })
        let InstanceID1 = workflow_ID1[0].ID;
        const all_approvers = await SELECT.columns`UserMail as SecondApprover`.from(ProjectApprovalGroupParticipants).where({ ID: req.ProjectID })
        const approver = await SELECT.columns`UserMail as SecondApprover`.from(ProjectApprovalGroupParticipants).where({ ID: req.ProjectID, UserID: req.UserID })

        let token2;
        //get token
        var getToken2 = {
            method: 'POST',
            url: 'https://7dcdf1e5trial.authentication.us10.hana.ondemand.com/oauth/token?grant_type=client_credentials',
            headers:
            {
                authorization: 'Basic c2ItY2xvbmUtMWVlMDI0MjUtNzRjZi00ZTU5LWFhNzYtMTg5YWY2M2E2ZmI0IWIzOTA1NXx3b3JrZmxvdyFiMTc3NDpkOGIwM2VjMi04NWY4LTQyMDMtYmI1Mi1jMTk0Mzg3ZjVjMzckRUtDSWZQVXREWFZOeTMtVlNiUDFLWkx1RDdLUm9jZVZaNDNMRTZkTFptOD0='
            },
            body: {
            },
            json: true

        };
        request(getToken2, function (error, response, body) {
            if (error) throw new Error(error)
            else {
                token2 = body.access_token
                let access_token2 = 'Bearer ' + token2;

                var url1 = 'https://api.workflow-sap.cfapps.us10.hana.ondemand.com/workflow-service/rest/v1/workflow-instances/' + InstanceID1 + '/execution-logs';
                var options2 = {
                    method: 'GET',
                    url: url1,
                    headers:
                    {
                        'postman-token': 'c460ea7e-6f8f-69ab-fade-2bb9c53978c3',
                        'cache-control': 'no-cache',
                        authorization: access_token2,
                        'content-type': 'application/json'
                    },
                    body: {
                    },
                    json: true
                };
                request(options2, function (error, response, body) {
                    if (error) throw new Error(error)
                    else {
                        for (let i = 0; i < all_approvers.length; i++) {
                            console.log(body[10 + i].type);
                            if (body[10 + i].type == 'REFERENCED_SUBFLOW_STARTED') {
                                const workflowInstanceId = body[10 + i].subflow.workflowInstanceId
                                var url2 = 'https://api.workflow-sap.cfapps.us10.hana.ondemand.com/workflow-service/rest/v1/workflow-instances/' + workflowInstanceId + '/execution-logs';
                                var options3 = {
                                    method: 'GET',
                                    url: url2,
                                    headers:
                                    {
                                        'postman-token': 'c460ea7e-6f8f-69ab-fade-2bb9c53978c3',
                                        'cache-control': 'no-cache',
                                        authorization: access_token2,
                                        'content-type': 'application/json'
                                    },
                                    body: {
                                    },
                                    json: true
                                };
                                request(options3, function (error, response, body) {
                                    if (error) throw new Error(error)
                                    else {
                                        for(let i=0 ; i<body.length ; i++) {
                                        if (body[i].type == 'USERTASK_CREATED') {
                                        console.log(body[i].recipientUsers[0]);
                                        console.log(approver[0].SecondApprover);
                                        if (approver[0].SecondApprover == body[i].recipientUsers[0]) {

                                            let approver_taskID = body[i].taskId
                                            //console.log(approver[0].SecondApprover, approver_taskID);


                                            var url3 = 'https://api.workflow-sap.cfapps.us10.hana.ondemand.com/workflow-service/rest/v1/task-instances/' + approver_taskID;
                                            var options4 = {
                                                method: 'PATCH',
                                                url: url3,
                                                headers:
                                                {
                                                    'postman-token': 'c460ea7e-6f8f-69ab-fade-2bb9c53978c3',
                                                    'cache-control': 'no-cache',
                                                    authorization: access_token2,
                                                    'content-type': 'application/json'
                                                },
                                                body: {
                                                    "context": {
                                                        "approve": true
                                                    },
                                                    "status": "COMPLETED"
                                                },
                                                json: true
                                            };
                                            request(options4, function (error, response, body) {
                                                if (error) throw new Error(error)
                                                else {
                                                    console.log("approved by ", approver[0].SecondApprover);
                                                }
                                            });

                                        }
                                    }
                                    }
                                    }
                                });
                            }
                        }
                    }
                });
            }
        });
    });

    ///////////////////////////////////////WORKFLOW LOGIC ENDS//////////////////////////////////////////
    srv.on("getdate", () => {
        return "2021-10-10";
    });


    srv.on("submitpublishquestionnaire", async req => {
        //const {QuestionnaireID, QuestionnaireName, Publish} = req.data;
        //  console.log(req.data);
        //const db = srv.transaction(req);
        //let {PublishedQuestionnaire} = srv.entities;
        // let results = await db.insert(PublishedQuestionnaire,[QuestionnaireID, QuestionnaireName, Publish])
        //console.log("Info:", results[0]);
        return "test";
    });

    //srv.before ("READ","AssessmentRequests", req=> {
    //   console.log(`Method: ${req.method}`.yellow.inverse);
    //  console.log(req.data);
    // const v2Date = req.data.deadline;
    //  v4Date = new Date(1 * v2Date.replace(/\/Date\(([-\d]*)\)\//, "$1"));
    // .toJSON works if v4 is datetime
    // .toJSON() 
    // use toISOstring + split if converting to a "Date only" format
    // v4Date.toISOString().split('T')[0];
    // console.log(v4Date);
    // });
}
