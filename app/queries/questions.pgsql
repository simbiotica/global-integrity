SELECT  categoryid, categoryname, questionid, questiontext,
  (SELECT
    array(SELECT targetid ||'---'||targetname  FROM export_dnorm_prod_107 t
where q.questionid = t.questionid
          and q.categoryid = t.categoryid
          GROUP BY targetid, targetname, questionid, questiontext
          ORDER BY targetid)
  ) as target_ids

from export_dnorm_prod_107 q
group by categoryid, categoryname, questionid, questiontext
order by categoryid
