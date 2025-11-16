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
        withCredentials([string(credentialsId: 'a02a4dc3-8191-4ee3-b81f-7365325765d3', variable: 'SNYK_TOKEN')]) {
            sh """
            cd backend
            docker run --rm \
              -e SNYK_TOKEN=$SNYK_TOKEN \
              -v "\$(pwd):/project" \
              snyk/snyk:python test --file=/project/requirements.txt || true
            """
        }
    }
}


  }
}
