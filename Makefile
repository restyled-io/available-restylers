.PHONY: watch
watch:
	yarn run tsc -- --watch

AWS ?= aws --profile restyled-ci

BUCKET = $(shell \
  $(AWS) cloudformation describe-stacks \
    --stack-name sites-docs \
    --query 'Stacks[*].Outputs[?OutputKey==`BucketName`].OutputValue' \
    --output text \
)
DISTRIBUTION_ID = $(shell \
  $(AWS) cloudformation describe-stacks \
    --stack-name sites-docs \
    --query 'Stacks[*].Outputs[?OutputKey==`DistributionId`].OutputValue' \
    --output text \
)

ROOT = ./public
PREFIX = /available-restylers

.PHONY: build
build:
	yarn run tsc

.PHONY: deploy
deploy: build
	@test -n "$(BUCKET)"
	$(AWS) s3 sync --acl public-read --delete $(ROOT)/ \
	  s3://$(BUCKET)$(PREFIX)/
	@test -n "$(DISTRIBUTION_ID)"
	$(AWS) cloudfront create-invalidation \
	  --distribution-id $(DISTRIBUTION_ID) --paths "$(PREFIX)/*"
