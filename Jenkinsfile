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

    stage('Debug Workspace') {
        steps {
            sh '''
            echo "Listing Jenkins workspace:"
            ls -la

            echo "Searching for semgrep_rules.yaml:"
            find . -name "semgrep_rules.yaml" || echo "File not found"
            '''
        }
    }

    stage('Semgrep Static Analysis') {
        steps {
            sh '''
            echo "Running Semgrep..."
            docker run --rm \
            -v $WORKSPACE:/src \
            -w /src semgrep/semgrep \
            semgrep --config semgrep_rules.yaml .
            '''
        }
    }

    stage('Snyk Dependency Scan') {
      steps {
        withCredentials([string(credentialsId: 'SNYK_TOKEN', variable: 'SNYK_TOKEN')]) {
          sh '''
            echo "Running Snyk scan..."
            docker run --rm \
              -e SNYK_TOKEN=$SNYK_TOKEN \
              -v $WORKSPACE/backend:/project \
              snyk/snyk:python test --file=/project/requirements.txt || true
          '''
        }
      }
    }

  }
}
