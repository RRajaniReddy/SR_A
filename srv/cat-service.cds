using my.Survey as my from '../db/data-model';
using my.Views as views from '../db/CDSViews';


service CatalogService {
    entity Workflow                     as projection on my.Workflow;
    entity RegionMasterTable            as projection on my.RegionMasterTable;
    entity DepartmentMasterTable        as projection on my.DepartmentMasterTable;
    entity CommodityMasterTable         as projection on my.CommodityMasterTable;
    entity RiskControlMasterTable       as projection on my.RiskControlMasterTable;
    entity AssessmentQuestionnaireTable as projection on my.AssessmentQuestionnaireTable;
    entity AnswerTypeMasterTable        as projection on my.AnswerTypeMasterTable;
    entity PublishedQuestionnaire       as projection on my.PublishedQuestionnaire;
    entity QuestionnaireApprovalGroups  as projection on my.QuestionnaireApprovalGroups;
    entity ApprovalGroupParticipants    as projection on my.ApprovalGroupParticipants;
    entity CustomSelectAnswers          as projection on my.CustomSelectAnswers;
    entity Parent_Region                as projection on my.Parent_Region;
    entity Parent_Department            as projection on my.Parent_Department;
    entity Parent_Commodity             as projection on my.Parent_Commodity;

    entity AssessmentRequests
                                        // @(restrict: [
                                        //{ grant:['READ','WRITE','UPDATE'], where: 'RequestorName = $user' }
                                        //])
                                        as projection on my.AssessmentRequests;

    entity ResponseDetails              as projection on my.ResponseDetails;
    entity ApproverGrading              as projection on my.ApproverGrading;
    entity ApproverDetails              as projection on my.ApproverDetails;
    entity SupplierUserMasterTable      as projection on my.SupplierUserMasterTable;
    entity InternalUserMasterTable      as projection on my.InternalUserMasterTable;
    view ProjectApprovalGroupParticipants as select from views.ProjectApprovalGroupParticipants;
    view Graders as select from views.Graders;
    view Grading as select from views.Grading;
    view ApproverFinalGradingScore as select from views.ApproverFinalGradingScore;
    view ProjectFinalGradingScore as select from views.ProjectFinalGradingScore;
    view ApprovalGroups as select from views.ApprovalGroups;
    view QuestionnaireID as select from views.QuestionnaireID;
    view ApproverStatus as select from views.ApproverStatus;
    view FinalQuestionnaireID as select from views.FinalQuestionnaireID;
    view OpenAssessmentRequest as select from views.OpenAssessmentRequest;
    view AssessmentRequestStatus as select from views.AssessmentRequestStatus;
    view UserDetails as select from views.UserDetails;
    view OOTBReport as select from views.OOTBReport;
    // view PublishedQuestionnaireView as select from views.PublishedQuestionnaireView;
    function getdate() returns Date;
    //function submitpublishquestionnaire(QuestionnaireID : String,
    //                                   QuestionnaireName : String,
    //                                   Publish : String  ) returns String;
    function submitpublishquestionnaire(payloaddata : many PublishedQuestionnaire) returns String;
}
