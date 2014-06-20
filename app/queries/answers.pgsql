SELECT
targetid as targetid,

CASE
WHEN targetid=prev_target
AND categoryid=prev_cat
AND dnorm.questionid=prev_question
THEN ''
ELSE targetname
END as targetname,
categoryweight::integer,

CASE
WHEN dnorm.categoryid=prev_cat
THEN ''
ELSE categoryname
END as categoryname,

questionweight::integer,

CASE
WHEN dnorm.questionid=prev_question
THEN ''
ELSE questiontext
END as questiontext,
dnorm.questionid,
criterias.criterias,
categoryid,
answervalue,
answercomments,
answersourcedescription

FROM (
    SELECT categoryweight, categoryid, categoryname, questiontext, targetname, targetid, questionid, questionweight, answervalue, answercomments, answersourcedescription,

  lag(categoryid) OVER
  (ORDER BY categoryname desc, targetid ASC, categoryweight DESC, questionweight ASC) AS prev_cat,

  lag(questionid) OVER
  (ORDER BY categoryname desc, targetid ASC, categoryweight DESC, questionweight ASC) AS prev_question,

  lag(targetid) OVER
  (ORDER BY categoryname desc, targetid ASC, categoryweight DESC, questionweight ASC) AS prev_target

  FROM export_dnorm_prod_107
ORDER BY targetname, categoryweight asc, questionweight asc, questiontext asc
) dnorm,

-- question+criterias SUB-select
(SELECT questionid,
(SELECT
array(SELECT a.label ||'|'||a.criteria
      FROM export_criteria_prod_107 a
      where a.questionid = b.questionid
      )) as criterias
FROM export_criteria_prod_107 b
GROUP BY questionid, criterias
-- ORDER BY targetid
) criterias

where dnorm.questionid = criterias.questionid %s
order by targetid, categoryweight ASC, questionweight ASC,  questiontext desc
