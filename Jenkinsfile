pipeline {
  agent any
  options {
    timestamps()
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Semgrep Static Analysis') {
        steps {
            sh """
            echo "Running Semgrep..."
            semgrep --config semgrep_rules.yaml || true
            """
        }
    }

stage('Snyk Dependency Scan') {
    steps {
        withCredentials([string(credentialsId: 'SNYK_TOKEN', variable: 'SNYK_TOKEN')]) {
            sh """
            echo "Running Snyk..."
            docker run --rm \
              -e SNYK_TOKEN=$SNYK_TOKEN \
              -v "$WORKSPACE/backend:/project" \
              snyk/snyk:python \
              bash -c "snyk test --file=/project/requirements.txt || true"
            """
        }
    }
}


  }
}
