SELECT
categoryweight::integer,
CASE
WHEN categoryid=prev_cat
THEN ''
ELSE categoryname
END as categoryname,
questionweight::integer,
CASE
WHEN questionid=prev_question
THEN ''
ELSE questiontext
END as questiontext,
questionid,
CASE
WHEN targetid=prev_target
AND categoryid=prev_cat
AND questionid=prev_question
THEN ''
ELSE targetname
END as targetname,
categoryid,  answervalue, answercomments, answersourcedescription
FROM (
    SELECT categoryweight, categoryid, categoryname, questiontext, targetname, targetid, questionid, questionweight, answervalue, answercomments, answersourcedescription,
  lag(categoryid) OVER (ORDER BY categoryid ASC, questionid ASC, targetid ASC) AS prev_cat,
  lag(questionid) OVER (ORDER BY categoryid ASC, questionid ASC, targetid ASC) AS prev_question,
  lag(targetid) OVER (ORDER BY categoryid ASC, questionid ASC, targetid ASC) AS prev_target
    FROM export_dnorm_prod_107
) x
